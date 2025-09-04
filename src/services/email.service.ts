// import nodemailer from 'nodemailer';
// import { env } from '../config/env';
// import logger from '@/config/logger';

// export interface EmailData {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
// }

// export interface VerificationEmailData {
//   email: string;
//   firstName: string;
//   verificationToken: string;
// }

// export interface PasswordResetEmailData {
//   email: string;
//   firstName: string;
//   resetToken: string;
// }

// class EmailService {
//   private transporter: nodemailer.Transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: env.SMTP_HOST,
//       port: env.SMTP_PORT,
//       secure: env.SMTP_PORT === 465,
//       auth: {
//         user: env.SMTP_USER,
//         pass: env.SMTP_PASS,
//       },
//     });

//     // Verificar configuración en desarrollo
//     if (env.NODE_ENV === 'development') {
//       this.verifyConnection();
//     }
//   }

//   private async verifyConnection(): Promise<void> {
//     try {
//       await this.transporter.verify();
//       logger.info('Email service connected successfully');
//     } catch (error) {
//       logger.error('Email service connection failed:', error);
//     }
//   }

//   /**
//    * Enviar email genérico
//    */
//   async sendEmail(data: EmailData): Promise<boolean> {
//     try {
//       const mailOptions = {
//         from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
//         to: data.to,
//         subject: data.subject,
//         html: data.html,
//         text: data.text || this.stripHtml(data.html),
//       };

//       const result = await this.transporter.sendMail(mailOptions);
      
//       logger.info('Email sent successfully', {
//         to: data.to,
//         subject: data.subject,
//         messageId: result.messageId,
//       });

//       return true;
//     } catch (error) {
//       logger.error('Failed to send email:', {
//         to: data.to,
//         subject: data.subject,
//         error: error,
//       });
//       return false;
//     }
//   }

//   /**
//    * Enviar email de verificación
//    */
//   async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
//     const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${data.verificationToken}`;
    
//     const html = this.getVerificationEmailTemplate(data.firstName, verificationUrl);
    
//     return await this.sendEmail({
//       to: data.email,
//       subject: '✅ Verifica tu cuenta en Wiru',
//       html,
//     });
//   }

//   /**
//    * Enviar email de recuperación de contraseña
//    */
//   async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
//     const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${data.resetToken}`;
    
//     const html = this.getPasswordResetEmailTemplate(data.firstName, resetUrl);
    
//     return await this.sendEmail({
//       to: data.email,
//       subject: '🔐 Restablece tu contraseña en Wiru',
//       html,
//     });
//   }

//   /**
//    * Enviar email de bienvenida
//    */
//   async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
//     const html = this.getWelcomeEmailTemplate(firstName);
    
//     return await this.sendEmail({
//       to: email,
//       subject: '🎉 ¡Bienvenido a Wiru!',
//       html,
//     });
//   }

//   /**
//    * Template de verificación de email
//    */
//   private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Verifica tu cuenta - Wiru</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
//           <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
//         </div>
        
//         <div style="padding: 20px;">
//           <h2 style="color: #333;">¡Hola ${firstName}!</h2>
          
//           <p style="color: #666; line-height: 1.6;">
//             ¡Gracias por registrarte en Wiru! Para completar tu registro y comenzar a convertir tu chatarra electrónica en dinero, necesitas verificar tu dirección de email.
//           </p>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${verificationUrl}" style="background-color: #a8c241; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//               Verificar mi cuenta
//             </a>
//           </div>
          
//           <p style="color: #666; font-size: 14px;">
//             Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
//             <br>
//             <a href="${verificationUrl}" style="color: #a8c241; word-break: break-all;">${verificationUrl}</a>
//           </p>
          
//           <hr style="border: 1px solid #eee; margin: 30px 0;">
          
//           <p style="color: #999; font-size: 12px;">
//             Este enlace expira en 24 horas. Si no solicitaste esta verificación, puedes ignorar este email.
//           </p>
//         </div>
        
//         <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
//           <p style="color: #666; margin: 0;">
//             © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }

//   /**
//    * Template de recuperación de contraseña
//    */
//   private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Restablece tu contraseña - Wiru</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
//           <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
//         </div>
        
//         <div style="padding: 20px;">
//           <h2 style="color: #333;">Hola ${firstName},</h2>
          
//           <p style="color: #666; line-height: 1.6;">
//             Recibimos una solicitud para restablecer la contraseña de tu cuenta en Wiru. Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
//           </p>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//               Restablecer contraseña
//             </a>
//           </div>
          
//           <p style="color: #666; font-size: 14px;">
//             Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
//             <br>
//             <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
//           </p>
          
//           <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
//             <p style="margin: 0; color: #856404;">
//               <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta permanece segura.
//             </p>
//           </div>
          
//           <hr style="border: 1px solid #eee; margin: 30px 0;">
          
//           <p style="color: #999; font-size: 12px;">
//             Este enlace expira en 1 hora por seguridad.
//           </p>
//         </div>
        
//         <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
//           <p style="color: #666; margin: 0;">
//             © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }

//   /**
//    * Template de bienvenida
//    */
//   private getWelcomeEmailTemplate(firstName: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>¡Bienvenido a Wiru!</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
//       <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <h1 style="color: #a8c241; font-size: 32px; margin: 0;">WIRU</h1>
//           <p style="color: #666; font-size: 16px;">Reciclaje Inteligente</p>
//         </div>
        
//         <div style="padding: 20px;">
//           <h2 style="color: #333;">¡Bienvenido ${firstName}! 🎉</h2>
          
//           <p style="color: #666; line-height: 1.6;">
//             ¡Tu cuenta ha sido verificada exitosamente! Ya puedes comenzar a convertir tu chatarra electrónica en dinero de forma fácil y sostenible.
//           </p>
          
//           <div style="background-color: #d4edda; border-left: 4px solid #a8c241; padding: 15px; margin: 20px 0;">
//             <h3 style="color: #155724; margin: 0 0 10px 0;">¿Qué puedes hacer ahora?</h3>
//             <ul style="color: #155724; margin: 0; padding-left: 20px;">
//               <li>Crear tu primera orden de reciclaje</li>
//               <li>Subir fotos de tus dispositivos electrónicos</li>
//               <li>Programar la recolección a domicilio</li>
//               <li>Recibir pagos en tu billetera virtual</li>
//             </ul>
//           </div>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${env.FRONTEND_URL}/dashboard" style="background-color: #a8c241; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
//               Ir a mi Dashboard
//             </a>
//           </div>
          
//           <p style="color: #666; line-height: 1.6;">
//             Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
//           </p>
//         </div>
        
//         <div style="text-align: center; padding: 20px; background-color: #f9f9f9;">
//           <p style="color: #666; margin: 0;">
//             © ${new Date().getFullYear()} Wiru. Todos los derechos reservados.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }

//   /**
//    * Remover HTML tags para texto plano
//    */
//   private stripHtml(html: string): string {
//     return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
//   }
// }

// export const emailService = new EmailService();





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
//    * Inicializar el transportador de email
//    */
//   private static async getTransporter(): Promise<nodemailer.Transporter> {
//     if (this.transporter) {
//       return this.transporter;
//     }

//     // Configuración para desarrollo (Ethereal Email)
//     if (env.NODE_ENV === 'development' && !env.SMTP_HOST) {
//       logger.info('Using Ethereal Email for development');
      
//       const testAccount = await nodemailer.createTestAccount();
      
//       this.transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         secure: false,
//         auth: {
//           user: testAccount.user,
//           pass: testAccount.pass,
//         },
//       });

//       return this.transporter;
//     }

//     // Configuración para producción
//     if (env.SMTP_HOST) {
//       this.transporter = nodemailer.createTransport({
//         host: env.SMTP_HOST,
//         port: env.SMTP_PORT,
//         secure: env.SMTP_PORT === 465,
//         auth: {
//           user: env.SMTP_USER,
//           pass: env.SMTP_PASS,
//         },
//       });

//       return this.transporter;
//     }

//     // Fallback: usar Gmail (requiere configuración adicional)
//     throw new Error('SMTP configuration not found. Please configure email settings.');
//   }

//   /**
//    * Enviar email
//    */
//   static async sendEmail(options: EmailOptions): Promise<boolean> {
//     try {
//       const transporter = await this.getTransporter();

//       const mailOptions = {
//         from: `${env.FROM_NAME} <${env.FROM_EMAIL || env.SMTP_USER}>`,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//         text: options.text,
//       };

//       const info = await transporter.sendMail(mailOptions);

//       logger.info('Email sent successfully', {
//         to: options.to,
//         subject: options.subject,
//         messageId: info.messageId,
//       });

//       // En desarrollo, mostrar URL de preview
//       if (env.NODE_ENV === 'development' && !env.SMTP_HOST) {
//         logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
//       }

//       return true;
//     } catch (error) {
//       logger.error('Failed to send email', {
//         error: error instanceof Error ? error.message : error,
//         to: options.to,
//         subject: options.subject,
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
//     const verificationUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

//     const html = this.getVerificationEmailTemplate(firstName, verificationUrl);
//     const text = `Hola ${firstName}, por favor verifica tu email visitando: ${verificationUrl}`;

//     return this.sendEmail({
//       to: email,
//       subject: 'Verifica tu cuenta de Wiru',
//       html,
//       text,
//     });
//   }

//   /**
//    * Enviar email de bienvenida
//    */
//   static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
//     const html = this.getWelcomeEmailTemplate(firstName);
//     const text = `¡Bienvenido a Wiru, ${firstName}! Tu cuenta ha sido verificada exitosamente.`;

//     return this.sendEmail({
//       to: email,
//       subject: '¡Bienvenido a Wiru!',
//       html,
//       text,
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

//     const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);
//     const text = `Hola ${firstName}, restablece tu contraseña visitando: ${resetUrl}`;

//     return this.sendEmail({
//       to: email,
//       subject: 'Restablece tu contraseña - Wiru',
//       html,
//       text,
//     });
//   }

//   /**
//    * Template para email de verificación
//    */
//   private static getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>Verifica tu cuenta</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
//         .content { padding: 30px 20px; }
//         .button { 
//           display: inline-block; 
//           background: #4f46e5; 
//           color: white; 
//           padding: 12px 30px; 
//           text-decoration: none; 
//           border-radius: 5px; 
//           margin: 20px 0; 
//         }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
          
//           <p>Gracias por registrarte en Wiru. Para completar tu registro, necesitas verificar tu dirección de email.</p>
          
//           <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
          
//           <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
          
//           <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
//           <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
//           <p><strong>Este enlace expirará en 24 horas.</strong></p>
          
//           <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
//         </div>
        
//         <div class="footer">
//           <p>&copy; 2025 Wiru. Todos los derechos reservados.</p>
//           <p>Este email fue enviado a ${firstName} porque se registró en nuestra plataforma.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }

//   /**
//    * Template para email de bienvenida
//    */
//   private static getWelcomeEmailTemplate(firstName: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>¡Bienvenido a Wiru!</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #10b981; color: white; padding: 20px; text-align: center; }
//         .content { padding: 30px 20px; }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>¡Bienvenido a Wiru!</h1>
//         </div>
        
//         <div class="content">
//           <h2>¡Hola ${firstName}!</h2>
          
//           <p>¡Tu cuenta ha sido verificada exitosamente! Ahora puedes acceder a todas las funcionalidades de Wiru.</p>
          
//           <p>Con Wiru puedes:</p>
//           <ul>
//             <li>Vender tu chatarra electrónica de forma fácil y segura</li>
//             <li>Obtener cotizaciones instantáneas</li>
//             <li>Programar recolecciones a domicilio</li>
//             <li>Recibir pagos directamente en tu billetera virtual</li>
//           </ul>
          
//           <p>¡Comienza ahora y contribuye al cuidado del medio ambiente!</p>
//         </div>
        
//         <div class="footer">
//           <p>&copy; 2025 Wiru. Todos los derechos reservados.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }

//   /**
//    * Template para reset de contraseña
//    */
//   private static getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>Restablece tu contraseña</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
//         .content { padding: 30px 20px; }
//         .button { 
//           display: inline-block; 
//           background: #ef4444; 
//           color: white; 
//           padding: 12px 30px; 
//           text-decoration: none; 
//           border-radius: 5px; 
//           margin: 20px 0; 
//         }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
          
//           <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
          
//           <a href="${resetUrl}" class="button">Restablecer contraseña</a>
          
//           <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
//           <p><a href="${resetUrl}">${resetUrl}</a></p>
          
//           <p><strong>Este enlace expirará en 1 hora.</strong></p>
          
//           <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
//         </div>
        
//         <div class="footer">
//           <p>&copy; 2025 Wiru. Todos los derechos reservados.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
//   }
// }




import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import logger from '@/config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Crear transporter de SendGrid
   */
  private static createTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    // Verificar configuración de SendGrid
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error('SendGrid configuration missing. Check SMTP_HOST, SMTP_USER, and SMTP_PASS');
    }

    logger.info('Creating SendGrid transporter', {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      passConfigured: !!env.SMTP_PASS
    });

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false, // false para puerto 587
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return this.transporter;
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('=== EMAIL DEBUG START ===');
    console.log('SMTP Config:', {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS ? `${env.SMTP_PASS.substring(0, 5)}...` : 'NOT SET'
    });

    const transporter = this.createTransporter();
    
    // VERIFICAR CONEXIÓN PRIMERO
    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully');

    const mailOptions = {
      from: `${env.FROM_NAME || 'Wiru'} <${env.FROM_EMAIL || 'noreply@wiru.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || 'Email de verificación'
    };

    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });
    console.log('=== EMAIL DEBUG END ===');

    return true;

  } catch (error) {
    console.error('=== EMAIL ERROR ===');
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
    } else {
      console.error('Error type:', typeof error);
      console.error('Error message:', String(error));
    }
    // If error may have a 'code' property, use optional chaining and type assertion
    console.error('Error code:', (error as any)?.code);
    console.error('Full error:', error);
    console.error('=== EMAIL ERROR END ===');
    
    return false;
  }
}

  /**
   * Verificar conexión con SendGrid
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      await transporter.verify();
      logger.info('SendGrid connection verified successfully');
      return true;
    } catch (error) {
      logger.error('SendGrid connection failed', {
        error: error instanceof Error ? error.message : String(error),
        host: env.SMTP_HOST,
        user: env.SMTP_USER
      });
      return false;
    }
  }

  /**
   * Enviar email de verificación
   */
  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string
  ): Promise<boolean> {

    console.log('Aqiiii')
    const verificationUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica tu cuenta - Wiru</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .content h2 { color: #333; margin-bottom: 20px; }
        .content p { margin-bottom: 20px; color: #555; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { opacity: 0.9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .url-box { background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Wiru</h1>
          <p>Plataforma de Chatarra Electrónica</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${firstName}!</h2>
          
          <p>Gracias por registrarte en Wiru. Para completar tu registro y comenzar a usar nuestra plataforma, necesitas verificar tu dirección de email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
          </div>
          
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <div class="url-box">${verificationUrl}</div>
          
          <p><strong>Este enlace expirará en 24 horas por seguridad.</strong></p>
          
          <p>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
        </div>
        
        <div class="footer">
          <p><strong>© 2025 Wiru</strong> - Todos los derechos reservados</p>
          <p>Este email fue enviado porque se registró una cuenta con esta dirección.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    

    return await this.sendEmail({
      to: email,
      subject: 'Verifica tu cuenta de Wiru',
      html: html,
    });
  }

  /**
   * Enviar email de bienvenida
   */
  static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>¡Bienvenido a Wiru!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .feature { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 5px; border-left: 4px solid #48bb78; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Wiru!</h1>
          <p>Tu cuenta ha sido verificada exitosamente</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${firstName}!</h2>
          
          <p>¡Enhorabuena! Tu cuenta ha sido verificada correctamente. Ahora puedes acceder a todas nuestras funcionalidades:</p>
          
          <div class="feature">
            <strong>💰 Vende tu chatarra electrónica</strong><br>
            Obtén dinero por dispositivos que ya no uses
          </div>
          
          <div class="feature">
            <strong>⚡ Cotizaciones instantáneas</strong><br>
            Conoce el valor de tus dispositivos al momento
          </div>
          
          <div class="feature">
            <strong>🚚 Recolección a domicilio</strong><br>
            Programamos la recolección cuando te convenga
          </div>
          
          <div class="feature">
            <strong>💳 Pagos seguros</strong><br>
            Recibe tus pagos directamente en tu billetera virtual
          </div>
          
          <p>¡Comienza ahora y contribuye al cuidado del medio ambiente mientras generas ingresos adicionales!</p>
        </div>
        
        <div class="footer">
          <p><strong>© 2025 Wiru</strong> - Juntos por un futuro más sostenible</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: '¡Bienvenido a Wiru! 🎉',
      html: html,
    });
  }

  /**
   * Enviar email de reset de contraseña
   */
  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Restablece tu contraseña - Wiru</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .warning { background: #fed7d7; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .url-box { background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Restablece tu contraseña</h1>
        </div>
        
        <div class="content">
          <h2>Hola ${firstName},</h2>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Wiru.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Restablecer contraseña</a>
          </div>
          
          <p>Si el botón no funciona, copia y pega este enlace:</p>
          <div class="url-box">${resetUrl}</div>
          
          <div class="warning">
            <p><strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.</p>
          </div>
          
          <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
        </div>
        
        <div class="footer">
          <p><strong>© 2025 Wiru</strong> - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Wiru',
      html: html,
    });
  }

  /**
   * Obtener estadísticas del servicio
   */
  static async getServiceStats(): Promise<{
    provider: string;
    configured: boolean;
    connectionStatus: boolean;
  }> {
    const configured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
    let connectionStatus = false;

    if (configured) {
      connectionStatus = await this.verifyConnection();
    }

    return {
      provider: 'SendGrid',
      configured,
      connectionStatus,
    };
  }
}