// backend/src/app.module.ts - SESSION POOLER CON FIX SCRAM
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarteraModule } from './modules/cartera/cartera.module';
import { FlujoModule } from './modules/flujo/flujo.module';
import { AdresModule } from './modules/adres/adres.module';
import { AuthService } from './modules/auth/auth.service';
import { CarteraService } from './modules/cartera/cartera.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      
      // Session Pooler con nueva contraseña
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.knditzgnblymqvmnmbmc',
      password: 'w3eEctJeKkBGhXuE', // Nueva contraseña
      database: 'postgres',
      
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      
      // NO SSL para Session Pooler
      ssl: false,
      
      // Configuración específica del pool para resolver SCRAM
      extra: {
        // Pool settings básicos
        max: 3,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 10000,
        
        // Configuración específica para SCRAM authentication
        application_name: 'nestjs-cartera',
        
        // Configuraciones del cliente PostgreSQL
        binary: false,  // Usar protocolo de texto, no binario
        
        // Configuración de autenticación
        connect_timeout: 10,
        
        // Configuración de red
        keepalive: true,
        keepalives_idle: 600,
        keepalives_interval: 30,
        keepalives_count: 3,
        
        // Configuración específica para Supabase
        options: '-c search_path=public',
        
        // Configuración de query
        statement_timeout: 30000,
        query_timeout: 30000,
        
        // Encoding
        client_encoding: 'UTF8',
      },
      
      retryAttempts: 3,
      retryDelay: 2000,
      autoLoadEntities: true,
      maxQueryExecutionTime: 30000,
    }),
    AuthModule,
    CarteraModule,
    FlujoModule,
    AdresModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private carteraService: CarteraService
  ) {}

  async onModuleInit() {
    try {
      console.log('🔧 Inicializando aplicación...');
      console.log('🔗 Conectando vía Session Pooler (con fix SCRAM)');
      console.log('📊 Host: aws-0-us-east-1.pooler.supabase.com:5432');
      console.log('👤 Usuario: postgres.knditzgnblymqvmnmbmc');
      
      // Esperar un poco para la conexión inicial
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.authService.createDefaultAdmin();
      await this.carteraService.initializePeriodos();
      await this.initializeBasicData();
      
      console.log('✅ ¡Aplicación lista en http://localhost:3001!');
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('🔍 Código de error:', error.code);
    }
  }

  private async initializeBasicData() {
    try {
      const basicEPS = [
        { codigo: 'COMPENSAR', nombre: 'COMPENSAR' },
        { codigo: 'COOSALUD', nombre: 'COOSALUD' },
        { codigo: 'FAMISANAR', nombre: 'FAMISANAR' },
        { codigo: 'MUTUALSER', nombre: 'MUTUALSER' },
        { codigo: 'NUEVA_EPS', nombre: 'NUEVA EPS' },
        { codigo: 'SALUD_TOTAL', nombre: 'SALUD TOTAL' },
        { codigo: 'SANITAS', nombre: 'SANITAS' },
        { codigo: 'SURA', nombre: 'SURA' },
      ];

      for (const epsData of basicEPS) {
        await this.carteraService.findOrCreateEPS(epsData.nombre, epsData.codigo);
      }
    } catch (error) {
      console.error('Error inicializando datos:', error);
    }
  }
}