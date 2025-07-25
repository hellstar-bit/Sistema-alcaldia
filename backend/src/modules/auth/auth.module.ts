// backend/src/modules/auth/auth.module.ts - VERSIÓN CON CONFIGSERVICE
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'tu_jwt_secret_super_seguro';
        const expiresIn = configService.get<string>('JWT_EXPIRATION') || '24h';
        
        console.log('🔧 JwtModule: Configuración', {
          secretPreview: secret.substring(0, 10) + '...',
          secretLength: secret.length,
          expiresIn,
        });

        return {
          secret,
          signOptions: { 
            expiresIn,
            // No agregar notBefore para evitar problemas
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}