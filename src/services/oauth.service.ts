import axios from 'axios';
import { env } from '../config/env';
import prisma from '@/config/database';
import { JwtUtils } from '@/utils/jwt.utils';
import logger from '@/config/logger';
import bcrypt from 'bcryptjs';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface FacebookUserInfo {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export interface OAuthLoginResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    type: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

class OAuthService {
  /**
   * Obtener información del usuario de Google
   */
  async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching Google user info:', error);
      throw new Error('No se pudo obtener la información del usuario de Google');
    }
  }

  /**
   * Obtener información del usuario de Facebook
   */
  async getFacebookUserInfo(accessToken: string): Promise<FacebookUserInfo> {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/me',
        {
          params: {
            access_token: accessToken,
            fields: 'id,email,name,first_name,last_name,picture',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching Facebook user info:', error);
      throw new Error('No se pudo obtener la información del usuario de Facebook');
    }
  }

  /**
   * Procesar login con Google
   */
  async loginWithGoogle(accessToken: string): Promise<OAuthLoginResult> {
    const googleUser = await this.getGoogleUserInfo(accessToken);

    if (!googleUser.verified_email) {
      throw new Error('El email de Google no está verificado');
    }

    return this.processOAuthLogin({
      provider: 'GOOGLE',
      providerAccountId: googleUser.id,
      email: googleUser.email,
      firstName: googleUser.given_name || googleUser.name.split(' ')[0],
      lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' '),
      avatar: googleUser.picture,
      accessToken,
    });
  }

  /**
   * Procesar login con Facebook
   */
  async loginWithFacebook(accessToken: string): Promise<OAuthLoginResult> {
    const facebookUser = await this.getFacebookUserInfo(accessToken);

    if (!facebookUser.email) {
      throw new Error('No se pudo obtener el email de Facebook');
    }

    return this.processOAuthLogin({
      provider: 'FACEBOOK',
      providerAccountId: facebookUser.id,
      email: facebookUser.email,
      firstName: facebookUser.first_name,
      lastName: facebookUser.last_name,
      avatar: facebookUser.picture?.data?.url,
      accessToken,
    });
  }

  /**
   * Procesar login OAuth genérico
   */
  private async processOAuthLogin(data: {
    provider: 'GOOGLE' | 'FACEBOOK';
    providerAccountId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    accessToken: string;
  }): Promise<OAuthLoginResult> {
    let isNewUser = false;

    // Buscar cuenta OAuth existente
    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    let user = oauthAccount?.user;

    // Si no existe la cuenta OAuth, buscar usuario por email
    if (!user) {
      const foundUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      user = foundUser === null ? undefined : foundUser;

      // Si existe usuario con ese email, vincular cuenta OAuth
      if (user) {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
            accessToken: data.accessToken,
          },
        });

        logger.info('OAuth account linked to existing user', {
          userId: user.id,
          provider: data.provider,
        });
      }
    }

    // Si no existe el usuario, crear uno nuevo
    if (!user) {
      isNewUser = true;

      // Generar código de referido único
      const generateReferralCode = (): string => {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      };

      let referralCode = generateReferralCode();
      while (await prisma.user.findUnique({ where: { referralCode } })) {
        referralCode = generateReferralCode();
      }

      // Crear usuario y cuenta OAuth en una transacción
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            password: await bcrypt.hash(Math.random().toString(36), 10), // Password aleatoria
            firstName: data.firstName,
            lastName: data.lastName,
            avatar: data.avatar,
            role: 'USER',
            type: 'PERSON',
            status: 'ACTIVE',
            isEmailVerified: true, // OAuth emails están pre-verificados
            emailVerifiedAt: new Date(),
            referralCode,
          },
        });

        await tx.oAuthAccount.create({
          data: {
            userId: newUser.id,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
            accessToken: data.accessToken,
          },
        });

        // Crear wallet
        await tx.wallet.create({
          data: {
            userId: newUser.id,
          },
        });

        return newUser;
      });

      user = result;

      logger.info('New user created via OAuth', {
        userId: user.id,
        email: user.email,
        provider: data.provider,
      });
    } else {
      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Actualizar token de acceso OAuth
      await prisma.oAuthAccount.updateMany({
        where: {
          userId: user.id,
          provider: data.provider,
        },
        data: {
          accessToken: data.accessToken,
        },
      });
    }

    // Generar tokens JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
    };

    const tokenPair = JwtUtils.generateTokenPair(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        type: user.type,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      isNewUser,
    };
  }

  /**
   * Desvincular cuenta OAuth
   */
  async unlinkOAuthAccount(userId: string, provider: 'GOOGLE' | 'FACEBOOK'): Promise<boolean> {
    try {
      const result = await prisma.oAuthAccount.deleteMany({
        where: {
          userId,
          provider,
        },
      });

      logger.info('OAuth account unlinked', { userId, provider });
      return result.count > 0;
    } catch (error) {
      logger.error('Error unlinking OAuth account:', error);
      return false;
    }
  }

  /**
   * Obtener cuentas OAuth vinculadas de un usuario
   */
  async getUserOAuthAccounts(userId: string) {
    return prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        provider: true,
        createdAt: true,
      },
    });
  }

  /**
   * Validar token de Google
   */
  async validateGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );

      if (response.data.aud !== env.GOOGLE_CLIENT_ID) {
        throw new Error('Invalid Google client ID');
      }

      return {
        id: response.data.sub,
        email: response.data.email,
        name: response.data.name,
        given_name: response.data.given_name,
        family_name: response.data.family_name,
        picture: response.data.picture,
        verified_email: response.data.email_verified === 'true',
      };
    } catch (error) {
      logger.error('Error validating Google token:', error);
      return null;
    }
  }

  /**
   * Intercambiar código de autorización de Google por token
   */
  async exchangeGoogleCode(code: string): Promise<string> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Error exchanging Google code:', error);
      throw new Error('No se pudo intercambiar el código de Google');
    }
  }

  /**
   * Intercambiar código de autorización de Facebook por token
   */
  async exchangeFacebookCode(code: string): Promise<string> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: env.FACEBOOK_APP_ID,
          client_secret: env.FACEBOOK_APP_SECRET,
          redirect_uri: env.FACEBOOK_CALLBACK_URL,
          code,
        },
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Error exchanging Facebook code:', error);
      throw new Error('No se pudo intercambiar el código de Facebook');
    }
  }
}

export const oauthService = new OAuthService();