import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '@/config/logger';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailData {
  email: string;
  firstName: string;
  verificationToken: string;
}

export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  resetToken: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // Verificar configuración en desarrollo
    if (env.NODE_ENV === 'development') {
      this.verifyConnection();
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed:', error);
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || this.stripHtml(data.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to: data.to,
        subject: data.subject,
        messageId: result.messageId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email:', {
        to: data.to,
        subject: data.subject,
        error: error,
      });
      return false;
    }
  }

  /**
   * Enviar email de verificación
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${data.verificationToken}`;
    
    const html = this.getVerificationEmailTemplate(data.firstName, verificationUrl);
    
    return await this.sendEmail({
      to: data.email,
      subject: '✅ Verifica tu cuenta en Wiru',
      html,
    });
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${data.resetToken}`;
    
    const html = this.getPasswordResetEmailTemplate(data.firstName, resetUrl);
    
    return await this.sendEmail({
      to: data.email,
      subject: '🔐 Restablece tu contraseña en Wiru',
      html,
    });
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = this.getWelcomeEmailTemplate(firstName);
    
    return await this.sendEmail({
      to: email,
      subject: '🎉 ¡Bienvenido a Wiru!',
      html,
    });
  }

  /**
   * Template de verificación de email
   */
  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica tu cuenta - Wiru</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
          <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #333;">¡Hola ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            ¡Gracias por registrarte en Wiru! Para completar tu registro y comenzar a convertir tu chatarra electrónica en dinero, necesitas verificar tu dirección de email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #a8c241; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            <br>
            <a href="${verificationUrl}" style="color: #a8c241; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Este enlace expira en 24 horas. Si no solicitaste esta verificación, puedes ignorar este email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
          <p style="color: #666; margin: 0;">
            © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template de recuperación de contraseña
   */
  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablece tu contraseña - Wiru</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
          <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #333;">Hola ${firstName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Wiru. Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
            <br>
            <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta permanece segura.
            </p>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Este enlace expira en 1 hora por seguridad.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
          <p style="color: #666; margin: 0;">
            © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template de bienvenida
   */
  private getWelcomeEmailTemplate(firstName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Wiru!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
          <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #333;">¡Bienvenido ${firstName}! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6;">
            ¡Tu cuenta ha sido verificada exitosamente! Ya puedes comenzar a convertir tu chatarra electrónica en dinero de forma fácil y sostenible.
          </p>
          
          <div style="background-color: #d4edda; border-left: 4px solid #a8c241; padding: 15px; margin: 20px 0;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">¿Qué puedes hacer ahora?</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Crear tu primera orden de reciclaje</li>
              <li>Subir fotos de tus dispositivos electrónicos</li>
              <li>Programar la recolección a domicilio</li>
              <li>Recibir pagos en tu billetera virtual</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.FRONTEND_URL}/dashboard" style="background-color: #a8c241; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Ir a mi Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
          <p style="color: #666; margin: 0;">
            © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Remover HTML tags para texto plano
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();