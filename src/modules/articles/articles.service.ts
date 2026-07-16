import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    introduction: string;
    label: string[];
    text: string;
    show?: boolean;
    class?: number;
  }) {
    const article = await this.prisma.article.create({
      data: {
        name: dto.name,
        introduction: dto.introduction,
        label: JSON.stringify(dto.label),
        text: dto.text,
        show: dto.show ?? true,
        class: dto.class ?? 1,
        weight: 1,
      },
    });

    return { msg: '添加成功', data: this.formatArticle(article) };
  }

  async findPublished(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    articleClass?: number,
  ) {
    const where: any = { show: true };

    if (name) {
      where.name = { contains: name };
    }
    if (articleClass !== undefined && articleClass !== null) {
      where.class = articleClass;
    }

    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticle(a)), total };
  }

  async findDrafts(page: number = 1, pageSize: number = 10) {
    const where = { show: false };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticle(a)), total };
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return this.formatArticle(article);
  }

  async updateMeta(dto: {
    id: string;
    name: string;
    introduction: string;
    label: string[];
    weight?: number;
  }) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.id },
    });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const data: any = {
      name: dto.name,
      introduction: dto.introduction,
      label: JSON.stringify(dto.label),
    };
    if (dto.weight !== undefined) data.weight = dto.weight;

    const updated = await this.prisma.article.update({
      where: { id: dto.id },
      data,
    });

    return { msg: '修改成功', data: this.formatArticle(updated) };
  }

  async updateContent(id: string, text: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: { text },
    });

    return { msg: '修改成功', data: this.formatArticle(updated) };
  }

  async remove(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new BadRequestException('文章不存在');
    }

    await this.prisma.article.delete({ where: { id } });
    return { msg: '删除成功' };
  }

  async unpin(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new BadRequestException('文章不存在');
    }
    await this.prisma.article.update({ where: { id }, data: { weight: 1 } });
    return { msg: '取消置顶成功' };
  }

  async pin(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new BadRequestException('文章不存在');
    }
    await this.prisma.article.update({ where: { id }, data: { weight: 100 } });
    return { msg: '置顶成功' };
  }

  async publish(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new BadRequestException('文章不存在');
    }
    await this.prisma.article.update({ where: { id }, data: { show: true } });
    return { msg: '发布成功' };
  }

  async changeClass(id: string, articleClass: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new BadRequestException('文章不存在');
    }
    await this.prisma.article.update({
      where: { id },
      data: { class: articleClass },
    });
    return { msg: '分类修改成功' };
  }

  async incrementRead(id: string) {
    await this.prisma.article.update({
      where: { id },
      data: { read: { increment: 1 } },
    });
  }

  async findLatest(limit: number = 10) {
    const list = await this.prisma.article.findMany({
      where: { show: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
    return list.map((a) => this.formatArticle(a));
  }

  async findHot(limit: number = 10) {
    const list = await this.prisma.article.findMany({
      where: { show: true },
      orderBy: { read: 'desc' },
      take: limit,
    });
    return list.map((a) => this.formatArticle(a));
  }

  async findByDate(page: number = 1, pageSize: number = 10, articleClass: number = 1) {
    const where = { show: true, class: articleClass };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticle(a)), total };
  }

  async findByLabel(labelId: string, page: number = 1, pageSize: number = 10) {
    // label is stored as JSON string, use contains to match
    const where = {
      show: true,
      label: { contains: labelId },
    };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { weight: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticle(a)), total };
  }

  async findAbout() {
    const article = await this.prisma.article.findFirst({
      where: { show: true, class: 3 },
      orderBy: { createdAt: 'desc' },
    });
    return article ? this.formatArticle(article) : null;
  }

  async findByManualClass(page: number = 1, pageSize: number = 10) {
    const where = { class: 2 };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data: list.map((a) => this.formatArticle(a)), total };
  }

  // Parse JSON label field back to array
  private formatArticle(article: any) {
    return {
      ...article,
      label: typeof article.label === 'string' ? JSON.parse(article.label) : article.label,
    };
  }
}
