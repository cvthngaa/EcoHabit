import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('HTTP');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Log mỗi request: method, url, status, response time
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;
      const color =
        status >= 500 ? '\x1b[31m' // đỏ
        : status >= 400 ? '\x1b[33m' // vàng
        : status >= 300 ? '\x1b[36m' // cyan
        : '\x1b[32m'; // xanh lá
      logger.log(`${color}${method}\x1b[0m ${originalUrl} → ${color}${status}\x1b[0m (${ms}ms)`);
    });
    next();
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Prefix chung cho toàn bộ API
  app.setGlobalPrefix('api');

  // Cho phép frontend/mobile gọi sang backend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validate request body theo DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('EcoHabit API')
    .setDescription(
      'API cho hệ thống AI phân loại rác và khuyến khích bảo vệ môi trường',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'EcoHabit API Docs',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
