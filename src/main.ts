import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO })

  const app = await NestFactory.create(AppModule,{
    abortOnError: true
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins - you can restrict this to specific domains if needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization'
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env['PORT'] ?? 3000);
}
bootstrap();
