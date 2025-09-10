// import nodemailer from 'nodemailer';
// import { env } from '@/config/env';
// import logger from '@/config/logger';

// export interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }

// export class EmailService {
//   private static transporter: nodemailer.Transporter | null = null;

//   /**
//    * Crear transporter de SendGrid
//    */
//   private static createTransporter(): nodemailer.Transporter {
//     if (this.transporter) {
//       return this.transporter;
//     }

//     // Verificar configuración de SendGrid
//     if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
//       throw new Error('SendGrid configuration missing. Check SMTP_HOST, SMTP_USER, and SMTP_PASS');
//     }

//     logger.info('Creating SendGrid transporter', {
//       host: env.SMTP_HOST,
//       port: env.SMTP_PORT,
//       user: env.SMTP_USER,
//       passConfigured: !!env.SMTP_PASS
//     });

//     this.transporter = nodemailer.createTransport({
//       host: env.SMTP_HOST,
//       port: Number(env.SMTP_PORT),
//       secure: false, // false para puerto 587
//       auth: {
//         user: env.SMTP_USER,
//         pass: env.SMTP_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     return this.transporter;
//   }

//   static async sendEmail(options: EmailOptions): Promise<boolean> {
//   try {
//     console.log('=== EMAIL DEBUG START ===');
//     console.log('SMTP Config:', {
//       host: env.SMTP_HOST,
//       port: env.SMTP_PORT,
//       user: env.SMTP_USER,
//       pass: env.SMTP_PASS ? `${env.SMTP_PASS.substring(0, 5)}...` : 'NOT SET'
//     });

//     const transporter = this.createTransporter();
    
//     // VERIFICAR CONEXIÓN PRIMERO
//     console.log('Testing connection...');
//     await transporter.verify();
//     console.log('✅ Connection verified successfully');

//     const mailOptions = {
//       from: `${env.FROM_NAME || 'Wiru'} <${env.FROM_EMAIL || 'noreply@wiru.com'}>`,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//       text: options.text || 'Email de verificación'
//     };

//     console.log('Mail options:', {
//       from: mailOptions.from,
//       to: mailOptions.to,
//       subject: mailOptions.subject
//     });

//     console.log('Sending email...');
//     const info = await transporter.sendMail(mailOptions);
    
//     console.log('✅ Email sent successfully:', {
//       messageId: info.messageId,
//       response: info.response
//     });
//     console.log('=== EMAIL DEBUG END ===');

//     return true;

//   } catch (error) {
//     console.error('=== EMAIL ERROR ===');
//     if (error instanceof Error) {
//       console.error('Error type:', error.constructor.name);
//       console.error('Error message:', error.message);
//     } else {
//       console.error('Error type:', typeof error);
//       console.error('Error message:', String(error));
//     }
//     // If error may have a 'code' property, use optional chaining and type assertion
//     console.error('Error code:', (error as any)?.code);
//     console.error('Full error:', error);
//     console.error('=== EMAIL ERROR END ===');
    
//     return false;
//   }
// }

//   /**
//    * Verificar conexión con SendGrid
//    */
//   static async verifyConnection(): Promise<boolean> {
//     try {
//       const transporter = this.createTransporter();
//       await transporter.verify();
//       logger.info('SendGrid connection verified successfully');
//       return true;
//     } catch (error) {
//       logger.error('SendGrid connection failed', {
//         error: error instanceof Error ? error.message : String(error),
//         host: env.SMTP_HOST,
//         user: env.SMTP_USER
//       });
//       return false;
//     }
//   }

//   /**
//    * Enviar email de verificación
//    */
//   static async sendVerificationEmail(
//     email: string,
//     firstName: string,
//     verificationToken: string
//   ): Promise<boolean> {

//     console.log('Aqiiii')
//     const verificationUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="es">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Verifica tu cuenta - Wiru</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
//         .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
//         .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
//         .header h1 { margin: 0; font-size: 28px; }
//         .header p { margin: 10px 0 0 0; opacity: 0.9; }
//         .content { padding: 40px 30px; }
//         .content h2 { color: #333; margin-bottom: 20px; }
//         .content p { margin-bottom: 20px; color: #555; }
//         .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
//         .button:hover { opacity: 0.9; }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//         .url-box { background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 20px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Wiru</h1>
//           <p>Plataforma de Chatarra Electrónica</p>
//         </div>
        
//         <div class="content">
//           <h2>¡Hola ${firstName}!</h2>
          
//           <p>Gracias por registrarte en Wiru. Para completar tu registro y comenzar a usar nuestra plataforma, necesitas verificar tu dirección de email.</p>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
//           </div>
          
//           <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
//           <div class="url-box">${verificationUrl}</div>
          
//           <p><strong>Este enlace expirará en 24 horas por seguridad.</strong></p>
          
//           <p>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
//         </div>
        
//         <div class="footer">
//           <p><strong>© 2025 Wiru</strong> - Todos los derechos reservados</p>
//           <p>Este email fue enviado porque se registró una cuenta con esta dirección.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;

    

//     return await this.sendEmail({
//       to: email,
//       subject: 'Verifica tu cuenta de Wiru',
//       html: html,
//     });
//   }

//   /**
//    * Enviar email de bienvenida
//    */
//   static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
//     const html = `
//     <!DOCTYPE html>
//     <html lang="es">
//     <head>
//       <meta charset="UTF-8">
//       <title>¡Bienvenido a Wiru!</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
//         .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
//         .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 40px 20px; text-align: center; }
//         .header h1 { margin: 0; font-size: 28px; }
//         .content { padding: 40px 30px; }
//         .feature { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 5px; border-left: 4px solid #48bb78; }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>¡Bienvenido a Wiru!</h1>
//           <p>Tu cuenta ha sido verificada exitosamente</p>
//         </div>
        
//         <div class="content">
//           <h2>¡Hola ${firstName}!</h2>
          
//           <p>¡Enhorabuena! Tu cuenta ha sido verificada correctamente. Ahora puedes acceder a todas nuestras funcionalidades:</p>
          
//           <div class="feature">
//             <strong>💰 Vende tu chatarra electrónica</strong><br>
//             Obtén dinero por dispositivos que ya no uses
//           </div>
          
//           <div class="feature">
//             <strong>⚡ Cotizaciones instantáneas</strong><br>
//             Conoce el valor de tus dispositivos al momento
//           </div>
          
//           <div class="feature">
//             <strong>🚚 Recolección a domicilio</strong><br>
//             Programamos la recolección cuando te convenga
//           </div>
          
//           <div class="feature">
//             <strong>💳 Pagos seguros</strong><br>
//             Recibe tus pagos directamente en tu billetera virtual
//           </div>
          
//           <p>¡Comienza ahora y contribuye al cuidado del medio ambiente mientras generas ingresos adicionales!</p>
//         </div>
        
//         <div class="footer">
//           <p><strong>© 2025 Wiru</strong> - Juntos por un futuro más sostenible</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;

//     return await this.sendEmail({
//       to: email,
//       subject: '¡Bienvenido a Wiru! 🎉',
//       html: html,
//     });
//   }

//   /**
//    * Enviar email de reset de contraseña
//    */
//   static async sendPasswordResetEmail(
//     email: string,
//     firstName: string,
//     resetToken: string
//   ): Promise<boolean> {
//     const resetUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="es">
//     <head>
//       <meta charset="UTF-8">
//       <title>Restablece tu contraseña - Wiru</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
//         .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
//         .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 40px 20px; text-align: center; }
//         .content { padding: 40px 30px; }
//         .button { display: inline-block; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//         .warning { background: #fed7d7; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 4px; }
//         .url-box { background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 20px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Restablece tu contraseña</h1>
//         </div>
        
//         <div class="content">
//           <h2>Hola ${firstName},</h2>
          
//           <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Wiru.</p>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${resetUrl}" class="button">Restablecer contraseña</a>
//           </div>
          
//           <p>Si el botón no funciona, copia y pega este enlace:</p>
//           <div class="url-box">${resetUrl}</div>
          
//           <div class="warning">
//             <p><strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.</p>
//           </div>
          
//           <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
//         </div>
        
//         <div class="footer">
//           <p><strong>© 2025 Wiru</strong> - Todos los derechos reservados</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;

//     return await this.sendEmail({
//       to: email,
//       subject: 'Restablece tu contraseña - Wiru',
//       html: html,
//     });
//   }

//   /**
//    * Obtener estadísticas del servicio
//    */
//   static async getServiceStats(): Promise<{
//     provider: string;
//     configured: boolean;
//     connectionStatus: boolean;
//   }> {
//     const configured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
//     let connectionStatus = false;

//     if (configured) {
//       connectionStatus = await this.verifyConnection();
//     }

//     return {
//       provider: 'SendGrid',
//       configured,
//       connectionStatus,
//     };
//   }
// }





import nodemailer from 'nodemailer';
import { env } from '@/config/env';
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

class EmailServiceClass {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar transportador
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true para puerto 465, false para otros puertos
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
      console.log('✅ Email service connected successfully');
      logger.info('Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
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
      
      console.log('✅ Email sent successfully to:', data.to);
      logger.info('Email sent successfully', {
        to: data.to,
        subject: data.subject,
        messageId: result.messageId,
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
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
  async sendVerificationEmail(email: string, firstName: string, verificationToken: string): Promise<boolean> {
    // IMPORTANTE: Usar /auth/verify-email para que coincida con el frontend
    const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
    
    console.log('📧 Sending verification email to:', email);
    console.log('🔗 Verification URL:', verificationUrl);
    
    const html = this.getVerificationEmailTemplate(firstName, verificationUrl);
    
    return await this.sendEmail({
      to: email,
      subject: '✅ Verifica tu cuenta en Wiru',
      html,
    });
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);
    
    return await this.sendEmail({
      to: email,
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
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e5e5; }
        .logo { color: #a8c241; font-size: 32px; font-weight: bold; margin: 0; }
        .tagline { color: #666; font-size: 16px; margin: 5px 0 0 0; }
        .content { padding: 40px 20px; }
        .title { color: #333; font-size: 24px; margin-bottom: 20px; }
        .text { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #a8c241, #719428); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">WIRU</h1>
          <p class="tagline">Reciclaje Inteligente</p>
        </div>
        
        <div class="content">
          <h2 class="title">¡Hola ${firstName}!</h2>
          
          <p class="text">
            ¡Gracias por registrarte en Wiru! Para completar tu registro y comenzar a convertir tu chatarra electrónica en dinero, necesitas verificar tu dirección de email.
          </p>
          
          <p class="text">
            Haz clic en el botón de abajo para verificar tu cuenta:
          </p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">
              ✅ Verificar mi cuenta
            </a>
          </div>
          
          <p class="text">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${verificationUrl}" style="color: #a8c241;">${verificationUrl}</a>
          </p>
          
          <p class="text">
            Este enlace expirará en 24 horas por seguridad.
          </p>
          
          <p class="text">
            ¡Estamos emocionados de tenerte en nuestra comunidad!
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Wiru. Todos los derechos reservados.</p>
          <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template de reset de contraseña
   */
  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restablece tu contraseña - Wiru</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e5e5; }
        .logo { color: #a8c241; font-size: 32px; font-weight: bold; margin: 0; }
        .content { padding: 40px 20px; }
        .title { color: #333; font-size: 24px; margin-bottom: 20px; }
        .text { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #a8c241, #719428); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">WIRU</h1>
        </div>
        
        <div class="content">
          <h2 class="title">Restablece tu contraseña</h2>
          
          <p class="text">Hola ${firstName},</p>
          
          <p class="text">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Wiru.
          </p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              🔐 Restablecer contraseña
            </a>
          </div>
          
          <p class="text">
            Este enlace expirará en 1 hora por seguridad.
          </p>
          
          <p class="text">
            Si no solicitaste este cambio, puedes ignorar este email.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2024 Wiru. Todos los derechos reservados.</p>
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
      <title>¡Bienvenido a Wiru!</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { color: #a8c241; font-size: 32px; font-weight: bold; margin: 0; }
        .content { padding: 20px; }
        .title { color: #333; font-size: 24px; margin-bottom: 20px; }
        .text { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #a8c241, #719428); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">🎉 ¡Bienvenido a WIRU!</h1>
        </div>
        
        <div class="content">
          <h2 class="title">¡Hola ${firstName}!</h2>
          
          <p class="text">
            ¡Tu cuenta ha sido verificada exitosamente! Ahora puedes comenzar a convertir tu chatarra electrónica en dinero.
          </p>
          
          <p class="text">
            <strong>¿Qué puedes hacer ahora?</strong>
          </p>
          
          <ul style="color: #666; line-height: 1.8;">
            <li>📱 Subir fotos de tus dispositivos electrónicos</li>
            <li>💰 Recibir cotizaciones instantáneas</li>
            <li>📦 Programar recolección gratuita</li>
            <li>💳 Recibir pagos en 48 horas</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="button">
              🚀 Comenzar a vender
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Quitar HTML de texto
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}

// Exportar instancia única
export const EmailService = new EmailServiceClass();
