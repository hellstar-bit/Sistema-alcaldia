// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Configurar ValidationPipe global con transformación
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Importante: transforma los tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true, // Convierte strings a números/booleans automáticamente
      },
      whitelist: true, // Filtra propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Rechaza propiedades no definidas
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en puerto ${port}`);
}
bootstrap();