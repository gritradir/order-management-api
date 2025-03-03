import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  
  // Enable security headers
  app.use(helmet());
  
  // Enable compression
  app.use(compression());
  
  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Global prefix (optional)
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }
  
  // Setup Swagger documentation
  setupSwagger(app);
  
  // Start the application
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger documentation is available at: ${await app.getUrl()}/api`);
}

bootstrap().catch(err => {
  const logger = new Logger('Bootstrap');
  logger.error('Error starting application', err);
  process.exit(1);
});