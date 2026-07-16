import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
