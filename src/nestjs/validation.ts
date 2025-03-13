import { BadRequestException, Injectable, ParseIntPipe, PipeTransform, ValidationPipe,ArgumentMetadata  } from '@nestjs/common';

export const numberValidationPipe = new ValidationPipe({
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,
  forbidNonWhitelisted: true,
  skipMissingProperties: false,
  exceptionFactory: (errors) => errors,
})

@Injectable()
export class PositiveIntPipe extends ParseIntPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    const val = await super.transform(value, metadata);
    if (val <= 0) {
      throw new BadRequestException('Value must be greater than 0');
    }
    return val;
  }
}