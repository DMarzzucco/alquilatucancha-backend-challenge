import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './utils/GlobalFilterExceptions';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
