import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Transporter from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.qq.com'),
      port: this.configService.get<number>('SMTP_PORT', 465),
      secure: true, // true for 465
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  /**
   * Send a verification code or password reset email
   */
  async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ success: boolean; msg?: string }> {
    try {
      const from = this.configService.get<string>('SMTP_USER', '');
      await this.transporter.sendMail({
        from: `"Blog Admin" <${from}>`,
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(
    to: string,
    code: string,
    purpose: 'email' | 'password' = 'email',
  ): Promise<{ success: boolean; msg?: string }> {
    const subject =
      purpose === 'email' ? '邮箱验证码' : '密码重置验证码';
    const title =
      purpose === 'email' ? '您正在绑定邮箱' : '您正在重置密码';
    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>您的验证码是：</p>
        <h1 style="color: #409eff; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>验证码有效期为5分钟，请勿透露给他人。</p>
        <p style="color: #999;">如果这不是您的操作，请忽略此邮件。</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  /**
   * Send password to user (forgot password feature)
   */
  async sendPassword(
    to: string,
    password: string,
  ): Promise<{ success: boolean; msg?: string }> {
    const subject = '密码找回';
    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>密码找回</h2>
        <p>您的密码是：</p>
        <h1 style="color: #409eff; font-size: 24px;">${password}</h1>
        <p>请登录后及时修改密码。</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
