import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(dto: {
    id?: string;
    name: string;
    introduction: string;
    weight: number;
    dataList: any[];
  }) {
    if (dto.id) {
      const resume = await this.prisma.resume.findUnique({ where: { id: dto.id } });
      if (!resume) {
        throw new BadRequestException('记录不存在');
      }
      const updated = await this.prisma.resume.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          introduction: dto.introduction,
          weight: dto.weight,
          dataList: JSON.stringify(dto.dataList),
        },
      });
      return { msg: '修改成功', data: this.formatResume(updated) };
    } else {
      const created = await this.prisma.resume.create({
        data: {
          name: dto.name,
          introduction: dto.introduction,
          weight: dto.weight,
          dataList: JSON.stringify(dto.dataList),
        },
      });
      return { msg: '添加成功', data: this.formatResume(created) };
    }
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.resume.findMany({
        orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.resume.count(),
    ]);

    return { data: list.map((r) => this.formatResume(r)), total };
  }

  async findAllNoPagination() {
    const list = await this.prisma.resume.findMany({
      orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
    });
    return list.map((r) => this.formatResume(r));
  }

  async remove(id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      throw new BadRequestException('记录不存在');
    }

    await this.prisma.resume.delete({ where: { id } });
    return { msg: '删除成功' };
  }

  private formatResume(resume: any) {
    return {
      ...resume,
      dataList: typeof resume.dataList === 'string' ? JSON.parse(resume.dataList) : resume.dataList,
    };
  }
}
