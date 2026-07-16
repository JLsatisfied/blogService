import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(dto: {
    id?: string;
    name: string;
    introduction: string;
    urlname: string;
    github: string;
    icons: string;
  }) {
    if (dto.id) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.id } });
      if (!project) {
        throw new BadRequestException('项目不存在');
      }
      const updated = await this.prisma.project.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          introduction: dto.introduction,
          urlname: dto.urlname,
          github: dto.github,
          icons: dto.icons,
        },
      });
      return { msg: '修改成功', data: updated };
    } else {
      const created = await this.prisma.project.create({
        data: {
          name: dto.name,
          introduction: dto.introduction,
          urlname: dto.urlname,
          github: dto.github,
          icons: dto.icons,
        },
      });
      return { msg: '添加成功', data: created };
    }
  }

  async findAll(page: number = 1, pageSize: number = 10, name?: string) {
    const where: any = {};
    if (name) where.name = { contains: name };

    const [list, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: list, total };
  }

  async findAllNoPagination() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new BadRequestException('项目不存在');
    }

    await this.prisma.project.delete({ where: { id } });
    return { msg: '删除成功' };
  }
}
