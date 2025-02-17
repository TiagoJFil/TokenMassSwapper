import { ValidationPipe } from '@nestjs/common';
import { ValidationError, ValidatorOptions } from 'class-validator';

export const numberValidationPipe = new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,
  forbidNonWhitelisted: true,
  skipMissingProperties: false,
  exceptionFactory: (errors) => errors,
})
