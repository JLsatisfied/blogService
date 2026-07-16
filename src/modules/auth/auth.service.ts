import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

// In-memory verification code store (production should use Redis)
const codeStore = new Map<string, { code: string; expires: number }>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  healthCheck() {
    return { msg: 'Admin API is running' };
  }

  async checkAdminRegistration() {
    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    return { adminoffs: setting?.adminoffs ?? true };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { user: loginDto.user },
    });

    if (!user) {
      return { code: 200, msg: '用户名不存在', data: null };
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      return { code: 200, msg: '密码错误', data: null };
    }

    const payload = { id: user.id };
    const expiresIn =
      loginDto.remember === 'true'
        ? this.configService.get<string>('JWT_REMEMBER_EXPIRES_IN', '168h')
        : this.configService.get<string>('JWT_EXPIRES_IN', '24h');

    const token = this.jwtService.sign(payload, { expiresIn });

    return {
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        name: user.name,
        user: user.user,
        weight: user.weight,
        email: user.email,
        imgs: user.imgs,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { user: registerDto.user },
    });

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    let weight = '1';

    if (registerDto.weight === '2') {
      if (registerDto.number !== '805696667') {
        throw new BadRequestException('授权码错误');
      }
      weight = '2';
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    await this.prisma.user.create({
      data: {
        name: registerDto.name,
        user: registerDto.user,
        password: hashedPassword,
        weight,
      },
    });

    return { msg: '注册成功' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { user: forgotPasswordDto.user },
    });

    if (!user) {
      throw new BadRequestException('用户名不存在');
    }

    if (!user.email) {
      throw new BadRequestException('该账户未绑定邮箱，无法找回密码');
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    const result = await this.emailService.sendPassword(user.email, newPassword);

    if (!result.success) {
      throw new BadRequestException('邮件发送失败: ' + result.msg);
    }

    return { msg: '新密码已发送到您的邮箱' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        user: true,
        weight: true,
        email: true,
        imgs: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async sendVerificationEmail(userId: string, email: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该邮箱已被其他账户绑定');
    }

    const code = Math.random().toString().slice(2, 8);
    const key = `email_${email}`;

    codeStore.set(key, { code, expires: Date.now() + 5 * 60 * 1000 });

    const result = await this.emailService.sendVerificationCode(email, code, 'email');

    if (!result.success) {
      throw new BadRequestException('验证码发送失败: ' + result.msg);
    }

    return { msg: '验证码已发送' };
  }

  async bindEmail(userId: string, email: string, code: string) {
    const key = `email_${email}`;
    const stored = codeStore.get(key);

    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      throw new BadRequestException('验证码错误或已过期');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该邮箱已被其他账户绑定');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email },
    });
    codeStore.delete(key);

    return { msg: '邮箱绑定成功' };
  }

  async sendPasswordResetCode(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const code = Math.random().toString().slice(2, 8);
    const key = `pwd_${email}`;

    codeStore.set(key, { code, expires: Date.now() + 5 * 60 * 1000 });

    const result = await this.emailService.sendVerificationCode(email, code, 'password');

    if (!result.success) {
      throw new BadRequestException('验证码发送失败: ' + result.msg);
    }

    return { msg: '验证码已发送' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    code?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (code && user.email) {
      const key = `pwd_${user.email}`;
      const stored = codeStore.get(key);

      if (!stored || stored.code !== code || stored.expires < Date.now()) {
        throw new BadRequestException('验证码错误或已过期');
      }
      codeStore.delete(key);
    } else {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isOldPasswordValid) {
        throw new BadRequestException('原密码错误');
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { msg: '密码修改成功' };
  }

  async changeNickname(userId: string, name: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return { msg: '昵称修改成功' };
  }

  async changeAvatar(userId: string, imgs: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { imgs },
    });
    return { msg: '头像修改成功' };
  }
}
