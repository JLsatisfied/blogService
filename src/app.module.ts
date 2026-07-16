import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
      envFilePath: '.env',
    }),

    // Database (Prisma)
    DatabaseModule,

    // Static file serving for legacy frontends (optional)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'build'),
      serveRoot: '/',
      exclude: ['/admin/*', '/pc/*'],
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
    // Global JWT guard — all routes require JWT by default
    // Use @Public() decorator to skip authentication
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
