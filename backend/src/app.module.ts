// backend/src/app.module.ts - VERSIÓN ACTUALIZADA
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarteraModule } from './modules/cartera/cartera.module';
import { AuthService } from './modules/auth/auth.service';
import { CarteraService } from './modules/cartera/cartera.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'cartera_barranquilla',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.DB_LOGGING === 'true',
      
      // Configuraciones mejoradas para MySQL
      charset: 'utf8mb4',
      timezone: '+00:00',
      ssl: false,
      
      extra: {
        connectionLimit: 10,
      },
      
      
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
      dropSchema: false,
      migrationsRun: false,
    }),
    AuthModule,
    CarteraModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private carteraService: CarteraService
  ) {}

  async onModuleInit() {
    try {
      console.log('🔧 Inicializando módulo principal...');
      
      // Crear usuario administrador por defecto
      await this.authService.createDefaultAdmin();
      
      // Inicializar períodos
      await this.carteraService.initializePeriodos();
      
      // Inicializar datos básicos de EPS
      await this.initializeBasicData();
      
      console.log('✅ Módulo principal inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar el módulo principal:', error);
    }
  }

  private async initializeBasicData() {
    try {
      // Crear EPS básicas si no existen
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

      console.log('✅ Datos básicos de EPS inicializados');
    } catch (error) {
      console.error('❌ Error al inicializar datos básicos:', error);
    }
  }
}