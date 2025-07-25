// backend/src/modules/auth/strategies/jwt.strategy.ts - VERSIÓN CON CONFIGSERVICE
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'tu_jwt_secret_super_seguro';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
        clockTolerance: 30,
      },
    });

    console.log('🔑 JwtStrategy: Configuración', {
      secretPreview: secret.substring(0, 10) + '...',
      secretLength: secret.length,
      fromEnv: !!configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('🔍 JwtStrategy: Validando payload:', {
      sub: payload.sub,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
    });
    
    try {
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        console.log('❌ JwtStrategy: Usuario no encontrado para ID:', payload.sub);
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      console.log('✅ JwtStrategy: Usuario validado exitosamente:', user.email);
      return user;
    } catch (error) {
      console.error('❌ JwtStrategy: Error en validación:', error);
      throw new UnauthorizedException();
    }
  }
}