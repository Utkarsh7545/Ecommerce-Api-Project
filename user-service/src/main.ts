/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API for user management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const microservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: process.env.TCP_PORT,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.HTTP_PORT, () => {
    console.log('Application is running on http://localhost:3001');
  });
}
bootstrap();
