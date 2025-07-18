import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors({
  origin: 'http://localhost:8080', // PAS '*'
  methods: ['GET', 'POST'],
  credentials: true,
});
  await app.listen(3000);
}
bootstrap();