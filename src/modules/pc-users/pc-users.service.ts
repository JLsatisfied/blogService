import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { CreatePcUserDto } from './dto/create-pc-user.dto';
import { LoginPcUserDto } from './dto/login-pc-user.dto';

@Injectable()
export class PcUsersService {
  constructor(private prisma: PrismaService) {}

  async register(dto: CreatePcUserDto) {
    const existingUser = await this.prisma.pcUser.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.pcUser.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        username: dto.name,
      },
    });

    return {
      msg: '注册成功',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    };
  }

  async login(dto: LoginPcUserDto) {
    const user = await this.prisma.pcUser.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('密码错误');
    }

    return {
      name: user.name,
      email: user.email,
      username: user.username,
      imgs: user.imgs,
      type: user.type,
    };
  }

  async findById(id: string) {
    return this.prisma.pcUser.findUnique({ where: { id } });
  }
}
