import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log('=== DEBUG PrismaService ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('CWD:', process.cwd());
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('=========================');
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
