import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.label.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.label.count(),
    ]);

    return { data: list, total };
  }

  async findAllNoPagination() {
    const list = await this.prisma.label.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: list };
  }

  async createOrUpdate(name: string, id?: string) {
    if (id) {
      const label = await this.prisma.label.findUnique({ where: { id } });
      if (!label) {
        throw new BadRequestException('标签不存在');
      }
      const updated = await this.prisma.label.update({
        where: { id },
        data: { name },
      });
      return { msg: '修改成功', data: updated };
    } else {
      const existingLabel = await this.prisma.label.findUnique({
        where: { name },
      });
      if (existingLabel) {
        throw new BadRequestException('标签名已存在');
      }
      const created = await this.prisma.label.create({
        data: { name },
      });
      return { msg: '添加成功', data: created };
    }
  }

  async toggleShow(id: string) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new BadRequestException('标签不存在');
    }

    const updated = await this.prisma.label.update({
      where: { id },
      data: { show: !label.show },
    });
    return { msg: '操作成功', data: updated };
  }

  async remove(id: string) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new BadRequestException('标签不存在');
    }

    // Check if any articles use this label (label stored as JSON string containing the id)
    const articlesUsingLabel = await this.prisma.article.count({
      where: {
        label: { contains: id },
        show: true,
      },
    });

    if (articlesUsingLabel > 0) {
      throw new BadRequestException('该标签下有文章，不能删除');
    }

    await this.prisma.label.delete({ where: { id } });
    return { msg: '删除成功' };
  }
}
