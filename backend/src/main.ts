// backend/src/main.ts - VERSIÓN CORREGIDA CON CORS Y VALIDACIÓN
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS más permisivo para desarrollo
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://127.0.0.1:5173', 
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  });

  // Configurar pipes de validación global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend running on: http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.DB_DATABASE || 'cartera_barranquilla'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Using default'}`);
}

bootstrap().catch(error => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});