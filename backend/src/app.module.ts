// backend/src/app.module.ts - USANDO CONFIGURACIÓN SEPARADA
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarteraModule } from './modules/cartera/cartera.module';
import { FlujoModule } from './modules/flujo/flujo.module';
import { AdresModule } from './modules/adres/adres.module';
import { AuthService } from './modules/auth/auth.service';
import { CarteraService } from './modules/cartera/cartera.service';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
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
      console.log('🔧 Inicializando módulo principal...');
      console.log('🔗 Conectando vía Transaction Pooler...');
      console.log('📊 Host: aws-0-us-east-1.pooler.supabase.com:6543');
      console.log('👤 Usuario: postgres.knditzgnblymqvmnmbmc');
      
      // Esperar conexión inicial
      console.log('⏳ Esperando conexión estable...');
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      console.log('🔑 Creando usuario administrador...');
      await this.authService.createDefaultAdmin();
      
      console.log('📅 Inicializando períodos...');
      await this.carteraService.initializePeriodos();
      
      console.log('📋 Inicializando datos básicos...');
      await this.initializeBasicData();
      
      console.log('✅ Módulo principal inicializado correctamente');
      console.log('🚀 Aplicación lista en http://localhost:3001');
    } catch (error) {
      console.error('❌ Error al inicializar el módulo principal:');
      console.error('📝 Mensaje:', error.message);
      console.error('🔢 Código:', error.code);
      console.error('📋 Tipo:', error.constructor.name);
      
      // Información adicional para debug
      if (error.code === 'ECONNREFUSED') {
        console.error('🔌 La conexión fue rechazada. Verifica:');
        console.error('   - Host: aws-0-us-east-1.pooler.supabase.com');
        console.error('   - Puerto: 6543');
        console.error('   - Usuario: postgres.knditzgnblymqvmnmbmc');
      }
      
      if (error.message?.includes('SCRAM')) {
        console.error('🔐 Error de autenticación SCRAM. Verifica:');
        console.error('   - Contraseña correcta');
        console.error('   - Usuario con formato correcto');
        console.error('   - Transaction Pooler habilitado en Supabase');
      }
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

      console.log('✅ Datos básicos inicializados');
    } catch (error) {
      console.error('❌ Error al inicializar datos básicos:', error);
    }
  }
}