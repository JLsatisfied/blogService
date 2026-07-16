import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  healthCheck() {
    return { msg: 'PC API is running' };
  }

  // ─── PC User ────────────────────────────────────────────

  async registerUser(dto: { name: string; email: string; password: string }) {
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

    return { name: user.name, email: user.email, username: user.username };
  }

  async loginUser(dto: { email: string; password: string }) {
    const user = await this.prisma.pcUser.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('用户不存在');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new BadRequestException('密码错误');

    return {
      name: user.name, email: user.email, username: user.username,
      imgs: user.imgs, type: user.type,
    };
  }

  // ─── Messages ────────────────────────────────────────────

  async submitMessage(dto: { name: string; username: string; imgage?: string; value: string; type?: string }) {
    await this.prisma.message.create({
      data: {
        name: dto.name, username: dto.username,
        imgage: dto.imgage || null, value: dto.value,
        type: dto.type || '1', state: 0,
      },
    });
    return { msg: '留言成功' };
  }

  async findApprovedMessages(page: number = 1, pageSize: number = 10) {
    const where = { state: 1 };
    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.message.count({ where }),
    ]);
    return { data: list, total };
  }

  // ─── Articles ────────────────────────────────────────────

  async findArticles(page: number = 1, pageSize: number = 10) {
    const where = { show: true, class: 1 };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where, orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);
    return { data: list.map((a) => this.fmt(a)), total };
  }

  async findArticleDetail(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new BadRequestException('文章不存在');

    await this.prisma.article.update({
      where: { id }, data: { read: { increment: 1 } },
    });

    return this.fmt({ ...article, read: article.read + 1 });
  }

  async findLatestArticles() {
    const list = await this.prisma.article.findMany({
      where: { show: true, class: 1 },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return list.map((a) => this.fmt(a));
  }

  async findHotArticles() {
    const list = await this.prisma.article.findMany({
      where: { show: true, class: 1 },
      orderBy: { read: 'desc' },
      take: 10,
    });
    return list.map((a) => this.fmt(a));
  }

  async findArticlesByDate(page: number = 1, pageSize: number = 10) {
    const where = { show: true, class: 1 };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);
    return { data: list.map((a) => this.fmt(a)), total };
  }

  async findAbout() {
    const article = await this.prisma.article.findFirst({
      where: { show: true, class: 3 }, orderBy: { createdAt: 'desc' },
    });
    return article ? this.fmt(article) : null;
  }

  // ─── Labels ──────────────────────────────────────────────

  async findAllLabels() {
    return this.prisma.label.findMany({
      where: { show: true }, orderBy: { createdAt: 'desc' },
    });
  }

  async findArticlesByLabel(labelId: string, page: number = 1, pageSize: number = 10) {
    const where = { show: true, label: { contains: labelId } };
    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where, orderBy: { weight: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);
    return { data: list.map((a) => this.fmt(a)), total };
  }

  async findLabelName(id: string) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) throw new BadRequestException('标签不存在');
    return label;
  }

  // ─── Projects ────────────────────────────────────────────

  async findAllProjects() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // ─── Manuals ─────────────────────────────────────────────

  async findAllManuals() {
    return this.prisma.manual.findMany({
      select: { id: true, name: true, imgs: true, introduction: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findManualsPaginated(page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.manual.findMany({
        select: { id: true, name: true, imgs: true, introduction: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.manual.count(),
    ]);
    return { data: list, total };
  }

  async findManualDetail(id: string) {
    const manual = await this.prisma.manual.findUnique({ where: { id } });
    return this.fmtManual(manual);
  }

  // ─── Resume ──────────────────────────────────────────────

  async findAllResume() {
    const list = await this.prisma.resume.findMany({
      orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
    });
    return list.map((r) => this.fmtResume(r));
  }

  // ─── Admin Info ──────────────────────────────────────────

  async findAdminInfo() {
    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    return { name: setting?.name || null, nameimgs: setting?.nameimgs || null };
  }

  async findLeftSidebarInfo() {
    const setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    return {
      imgs: setting?.imgs || null, github: setting?.github || null,
      juejin: setting?.juejin || null, name: setting?.name || null,
      nameimgs: setting?.nameimgs || null,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────

  private fmt(a: any) {
    return { ...a, label: typeof a.label === 'string' ? JSON.parse(a.label) : a.label };
  }

  private fmtManual(m: any) {
    return { ...m, list: typeof m?.list === 'string' ? JSON.parse(m.list) : m?.list };
  }

  private fmtResume(r: any) {
    return { ...r, dataList: typeof r?.dataList === 'string' ? JSON.parse(r.dataList) : r.dataList };
  }
}
