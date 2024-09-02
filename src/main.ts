import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'http://5.189.160.223:3001',
    // origin: 'http://localhost:3000',
    origin: 'https://auto.hr.arisaftech.com',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Auto HR API')
    .setDescription('Api Documentation for Autohr')
    .setVersion('1.0')
    .addTag('Autohr')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  await app.listen(5000);
}
bootstrap();
