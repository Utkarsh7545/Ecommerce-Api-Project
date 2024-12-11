import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('API documentation for the Product Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const microservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: process.env.TCP,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.HTTP, () => {
    console.log('Application is running on http://localhost:3002');
  });
}
bootstrap();
