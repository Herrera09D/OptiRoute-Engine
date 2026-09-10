import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('API para gestión de pedidos y clientes en OptiRoute-Engine')
    .setVersion('1.0')
    .addTag('orders', 'Gestión de pedidos')
    .addTag('clients', 'Gestión de clientes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT', 8081);
  await app.listen(port);
  console.log(`Order Service corriendo en http://localhost:${port}`);
  console.log(`Swagger UI disponible en http://localhost:${port}/api`);
}

bootstrap();
