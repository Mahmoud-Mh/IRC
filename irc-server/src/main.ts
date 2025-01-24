import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:5173', // Use environment variable or default
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap();