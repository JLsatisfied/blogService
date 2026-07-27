import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PcUsersModule } from './modules/pc-users/pc-users.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ManualsModule } from './modules/manuals/manuals.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ResumeModule } from './modules/resume/resume.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SettingsModule } from './modules/settings/settings.module';
import { EmailModule } from './modules/email/email.module';
import { PublicModule } from './modules/public/public.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`),
    }),

    // Rate limiting — protect public endpoints
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,  // 1 minute window
      limit: 120,    // max 120 requests per minute per IP
    }]),

    // Database (Prisma)
    DatabaseModule,

    // Blog frontend (myblog) — served at /
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'blogbuild'),
      serveRoot: '/',
      exclude: ['/admin/*', '/pc/*', '/backend/*'],
    }),

    // Admin panel (zetaAdmin) — served at /backend
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'backend'),
      serveRoot: '/backend',
    }),

    // Feature modules
    EmailModule,
    AuthModule,
    UsersModule,
    PcUsersModule,
    LabelsModule,
    ArticlesModule,
    ManualsModule,
    ProjectsModule,
    ResumeModule,
    MessagesModule,
    SettingsModule,
    PublicModule,
    AiModule,
  ],
  providers: [
    // Global rate limiting (120 req/min per IP)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT guard — all routes require JWT by default
    // Use @Public() decorator to skip authentication
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
