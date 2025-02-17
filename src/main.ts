import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  dotenv  from 'dotenv';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';




async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create(AppModule,{
    abortOnError: true
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env['PORT'] ?? 3000);
}
bootstrap();
