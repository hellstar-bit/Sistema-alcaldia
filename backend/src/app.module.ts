// backend/src/app.module.ts - SESSION POOLER CON FIX SCRAM
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarteraModule } from './modules/cartera/cartera.module';
import { FlujoModule } from './modules/flujo/flujo.module';
import { AdresModule } from './modules/adres/adres.module';
import { HealthModule } from './health/health.module'; // ✅ AGREGADO
import { AuthService } from './modules/auth/auth.service';
import { CarteraService } from './modules/cartera/cartera.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      
      // Para producción usará Transaction Pooler, para desarrollo Session Pooler
      host: process.env.NODE_ENV === 'production' 
        ? 'aws-0-us-east-1.pooler.supabase.com'
        : 'aws-0-us-east-1.pooler.supabase.com',
      port: process.env.NODE_ENV === 'production' ? 6543 : 5432, // Transaction en prod, Session en dev
      username: 'postgres.knditzgnblymqvmnmbmc',
      password: 'w3eEctJeKkBGhXuE',
      database: 'postgres',
      
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
      logging: false,
      
      ssl: false,
      
      extra: {
        max: process.env.NODE_ENV === 'production' ? 3 : 2,
        min: 1,
        idleTimeoutMillis: 100000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 10000,
        
        application_name: 'nestjs-cartera',
        binary: false,
        connect_timeout: 10,
        keepalive: true,
        keepalives_idle: 600,
        keepalives_interval: 30,
        keepalives_count: 3,
        options: '-c search_path=public',
        statement_timeout: 100000,
        query_timeout: 100000,
        client_encoding: 'UTF8',
      },
      
      retryAttempts: 3,
      retryDelay: 2000,
      autoLoadEntities: true,
      maxQueryExecutionTime: 100000,
    }),
    AuthModule,
    CarteraModule,
    FlujoModule,
    AdresModule,
    HealthModule, // ✅ AGREGADO
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
      console.log('🌍 Ambiente:', process.env.NODE_ENV);
      console.log('🔗 Conectando vía', process.env.NODE_ENV === 'production' ? 'Transaction Pooler' : 'Session Pooler');
      console.log('📊 Host: aws-0-us-east-1.pooler.supabase.com');
      console.log('👤 Usuario: postgres.knditzgnblymqvmnmbmc');
      
      // Solo esperar en desarrollo
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      await this.authService.createDefaultAdmin();
      await this.carteraService.initializePeriodos();
      await this.initializeBasicData();
      
      const port = process.env.PORT || 3001;
      console.log(`✅ ¡Aplicación lista en puerto ${port}!`);
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