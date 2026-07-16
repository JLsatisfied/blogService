import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, pageSize: number = 10, name?: string) {
    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          user: true,
          weight: true,
          email: true,
          imgs: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: list, total };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    await this.prisma.user.delete({ where: { id } });
    return { msg: '删除成功' };
  }

  async findAllPcUsers(page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.pcUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          type: true,
          imgs: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.pcUser.count(),
    ]);

    return { data: list, total };
  }

  async removePcUser(id: string) {
    const user = await this.prisma.pcUser.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    await this.prisma.pcUser.delete({ where: { id } });
    return { msg: '删除成功' };
  }
}
