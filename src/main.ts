import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 5005);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global response interceptor (wraps all responses in {code, data, msg, total})
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter (normalizes errors)
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  // SPA history-mode fallback: non-API GETs without file extension → index.html
  const distDir = join(__dirname, '..');
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.use((req: any, res: any, next: () => void) => {
    if (res.headersSent) return next();
    if (req.method !== 'GET') return next();
    const path: string = req.path;
    if (path.startsWith('/admin') || path.startsWith('/pc')) return next();
    if (/\.[a-z0-9]+$/i.test(path)) return next();

    if (path.startsWith('/backend')) {
      const f = join(distDir, 'backend', 'index.html');
      if (existsSync(f)) return res.sendFile(f);
    }
    const f = join(distDir, 'blogbuild', 'index.html');
    if (existsSync(f)) return res.sendFile(f);
    next();
  });

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
