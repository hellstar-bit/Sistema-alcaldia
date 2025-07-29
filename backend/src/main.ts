// backend/src/main.ts - VERSIÓN CORREGIDA COMPLETA
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CONFIGURAR CORS COMPLETO (incluye las headers necesarias)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://sistema-alcaldia.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // ✅ AGREGAR MÉTODOS
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'], // ✅ AGREGAR HEADERS
    credentials: true,
  });

  // Configurar ValidationPipe global con transformación
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en puerto ${port}`);
}
bootstrap();
