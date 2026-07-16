import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    username: string;
    imgage?: string;
    value: string;
    type?: string;
  }) {
    const message = await this.prisma.message.create({
      data: {
        name: dto.name,
        username: dto.username,
        imgage: dto.imgage || null,
        value: dto.value,
        type: dto.type || '1',
        state: 0,
      },
    });

    return { msg: '留言成功', data: message };
  }

  async findUnmoderated(page: number = 1, pageSize: number = 10) {
    const where = { state: 0 };
    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { data: list, total };
  }

  async findModerated(page: number = 1, pageSize: number = 10) {
    const where = { state: { not: 0 } };
    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { data: list, total };
  }

  async moderateState(id: string, state: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('留言不存在');
    }

    await this.prisma.message.update({ where: { id }, data: { state } });
    return { msg: '操作成功' };
  }

  async reply(id: string, adminmsg: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('留言不存在');
    }

    await this.prisma.message.update({
      where: { id },
      data: {
        adminmsg,
        admindata: new Date(),
        state: 1,
      },
    });
    return { msg: '回复成功' };
  }

  async remove(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new BadRequestException('留言不存在');
    }

    await this.prisma.message.delete({ where: { id } });
    return { msg: '删除成功' };
  }

  async findApproved(page: number = 1, pageSize: number = 10) {
    const where = { state: 1 };
    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { data: list, total };
  }
}
