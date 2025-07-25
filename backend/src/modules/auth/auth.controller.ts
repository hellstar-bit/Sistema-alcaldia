// backend/src/modules/auth/auth.controller.ts - AÑADIR ENDPOINT DE TEST
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        message: 'Login exitoso',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: { user: req.user },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return {
      success: true,
      message: 'Logout exitoso',
      data: null,
    };
  }

  // NUEVO ENDPOINT PARA DEBUGGING
  @Get('test-jwt')
  async testJWT(@Request() req) {
    const authHeader = req.headers.authorization;
    const secret = this.configService.get<string>('JWT_SECRET') || 'tu_jwt_secret_super_seguro';
    
    console.log('🧪 Testing JWT configuration:');
    console.log('- Auth Header:', authHeader?.substring(0, 30) + '...');
    console.log('- Secret Preview:', secret.substring(0, 10) + '...');
    console.log('- Secret Length:', secret.length);

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Intentar decodificar el token manualmente
        const decoded = this.jwtService.verify(token);
        console.log('✅ Token válido:', decoded);
        
        return {
          success: true,
          message: 'Token válido',
          data: {
            decoded,
            secretMatch: true,
          }
        };
      } catch (error) {
        console.error('❌ Error al verificar token:', error.message);
        
        return {
          success: false,
          message: 'Token inválido: ' + error.message,
          data: {
            error: error.message,
            secretUsed: secret.substring(0, 10) + '...',
          }
        };
      }
    }

    return {
      success: false,
      message: 'No token provided',
      data: {
        secretUsed: secret.substring(0, 10) + '...',
      }
    };
  }
}