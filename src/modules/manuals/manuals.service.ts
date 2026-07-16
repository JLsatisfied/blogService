import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ManualsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(dto: {
    id?: string;
    name: string;
    imgs: string;
    introduction: string;
  }) {
    if (dto.id) {
      const manual = await this.prisma.manual.findUnique({ where: { id: dto.id } });
      if (!manual) {
        throw new NotFoundException('手册不存在');
      }
      const updated = await this.prisma.manual.update({
        where: { id: dto.id },
        data: { name: dto.name, imgs: dto.imgs, introduction: dto.introduction },
      });
      return { msg: '修改成功', data: this.formatManual(updated) };
    } else {
      const existingManual = await this.prisma.manual.findUnique({
        where: { name: dto.name },
      });
      if (existingManual) {
        throw new BadRequestException('手册名已存在');
      }
      const created = await this.prisma.manual.create({
        data: {
          name: dto.name,
          imgs: dto.imgs,
          introduction: dto.introduction,
          list: '[]',
        },
      });
      return { msg: '添加成功', data: this.formatManual(created) };
    }
  }

  async findAll(page: number = 1, pageSize: number = 10, name?: string) {
    const where: any = {};
    if (name) where.name = { contains: name };

    const [list, total] = await Promise.all([
      this.prisma.manual.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.manual.count({ where }),
    ]);

    return { data: list.map((m) => this.formatManual(m)), total };
  }

  async findAllWithoutList() {
    const manuals = await this.prisma.manual.findMany({
      select: { id: true, name: true, imgs: true, introduction: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return manuals;
  }

  async findAllPaginated(page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.manual.findMany({
        select: { id: true, name: true, imgs: true, introduction: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.manual.count(),
    ]);

    return { data: list, total };
  }

  async findOneWithArticles(id: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id } });
    if (!manual) {
      throw new NotFoundException('手册不存在');
    }
    return this.formatManual(manual);
  }

  async findArticlesByManual(page: number = 1, pageSize: number = 10) {
    const where = { class: 2, show: true };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticleLabel(a)), total };
  }

  async addArticleToManual(manualId: string, articleId: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id: manualId } });
    if (!manual) {
      throw new NotFoundException('手册不存在');
    }

    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const list = JSON.parse(manual.list || '[]');
    const exists = list.some((item: any) => item.id === articleId);
    if (exists) {
      throw new BadRequestException('该文章已在手册中');
    }

    list.push({ id: article.id, name: article.name, introduction: article.introduction });

    await this.prisma.manual.update({
      where: { id: manualId },
      data: { list: JSON.stringify(list) },
    });

    return { msg: '添加成功' };
  }

  async findManualArticleList(manualId: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id: manualId } });
    if (!manual) {
      throw new NotFoundException('手册不存在');
    }
    return { data: JSON.parse(manual.list || '[]') };
  }

  async removeArticleFromManual(manualId: string, articleId: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id: manualId } });
    if (!manual) {
      throw new NotFoundException('手册不存在');
    }

    const list = JSON.parse(manual.list || '[]');
    const newList = list.filter((item: any) => item.id !== articleId);

    await this.prisma.manual.update({
      where: { id: manualId },
      data: { list: JSON.stringify(newList) },
    });

    return { msg: '移除成功' };
  }

  async remove(id: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id } });
    if (!manual) {
      throw new BadRequestException('手册不存在');
    }

    await this.prisma.manual.delete({ where: { id } });
    return { msg: '删除成功' };
  }

  private formatManual(manual: any) {
    return { ...manual, list: typeof manual.list === 'string' ? JSON.parse(manual.list) : manual.list };
  }

  private formatArticleLabel(article: any) {
    return { ...article, label: typeof article.label === 'string' ? JSON.parse(article.label) : article.label };
  }
}
