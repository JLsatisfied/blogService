import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async initSettings(dto: {
    imgs?: string;
    github?: string;
    juejin?: string;
    name?: string;
    nameimgs?: string;
    msgoffs?: boolean;
    adminoffs?: boolean;
    emailpassword?: string;
    eamils?: string;
  }) {
    const existing = await this.prisma.setting.findUnique({ where: { id: 1 } });

    const data: any = { id: 1 };
    if (!existing) {
      data.imgs = null;
      data.github = null;
      data.juejin = null;
      data.name = null;
      data.nameimgs = null;
      data.msgoffs = true;
      data.adminoffs = true;
      data.emailpassword = null;
      data.eamils = null;
    }

    // Override with provided values
    if (dto.imgs !== undefined) data.imgs = dto.imgs;
    if (dto.github !== undefined) data.github = dto.github;
    if (dto.juejin !== undefined) data.juejin = dto.juejin;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.nameimgs !== undefined) data.nameimgs = dto.nameimgs;
    if (dto.msgoffs !== undefined) data.msgoffs = dto.msgoffs;
    if (dto.adminoffs !== undefined) data.adminoffs = dto.adminoffs;
    if (dto.emailpassword !== undefined) data.emailpassword = dto.emailpassword;
    if (dto.eamils !== undefined) data.eamils = dto.eamils;

    await this.prisma.setting.upsert({
      where: { id: 1 },
      create: data,
      update: data,
    });

    return { msg: '设置成功' };
  }

  async getSettings() {
    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });

    if (!setting) {
      return {
        imgs: null, github: null, juejin: null, name: null, nameimgs: null,
        msgoffs: true, adminoffs: true, eamils: null,
      };
    }

    return {
      imgs: setting.imgs,
      github: setting.github,
      juejin: setting.juejin,
      name: setting.name,
      nameimgs: setting.nameimgs,
      msgoffs: setting.msgoffs,
      adminoffs: setting.adminoffs,
      eamils: setting.eamils,
    };
  }

  async updateSettings(dto: {
    imgs?: string;
    github?: string;
    juejin?: string;
    name?: string;
    nameimgs?: string;
    msgoffs?: boolean;
    adminoffs?: boolean;
    eamils?: string;
  }) {
    const data: any = {};
    if (dto.imgs !== undefined) data.imgs = dto.imgs;
    if (dto.github !== undefined) data.github = dto.github;
    if (dto.juejin !== undefined) data.juejin = dto.juejin;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.nameimgs !== undefined) data.nameimgs = dto.nameimgs;
    if (dto.msgoffs !== undefined) data.msgoffs = dto.msgoffs;
    if (dto.adminoffs !== undefined) data.adminoffs = dto.adminoffs;
    if (dto.eamils !== undefined) data.eamils = dto.eamils;

    await this.prisma.setting.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });

    return { msg: '设置更新成功' };
  }

  async updateEmailPass(emailpassword: string) {
    await this.prisma.setting.upsert({
      where: { id: 1 },
      create: { id: 1, emailpassword },
      update: { emailpassword },
    });

    return { msg: '邮箱密码更新成功' };
  }
}
