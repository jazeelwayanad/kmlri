import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Express's default body-parser limit is 100kb, far too small for bulk catalogue
  // imports (the Koha ODS/CSV importer can post thousands of accession-register rows
  // as JSON in one request).
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n======================================================`);
  console.log(`🏛️  KMLRI Library & Research Institute API Server`);
  console.log(`🚀  API running at http://localhost:${port}/api`);
  console.log(`======================================================\n`);
}
bootstrap();
