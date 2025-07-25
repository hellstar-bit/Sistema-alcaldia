// backend/src/modules/auth/auth.service.ts - VERSIÓN CON DEBUG MEJORADO
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Crear usuario
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generar token
    const token = await this.generateToken(savedUser);

    // Remover contraseña de la respuesta
    const { password, ...userResponse } = savedUser;

    return {
      user: userResponse,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    console.log('🔐 AuthService: Iniciando login para:', loginDto.email);
    
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      console.log('❌ AuthService: Usuario no encontrado:', email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('👤 AuthService: Usuario encontrado:', user.email);

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ AuthService: Contraseña inválida para:', email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ AuthService: Contraseña válida para:', email);

    // Actualizar último login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generar token
    const token = await this.generateToken(user);

    console.log('🎟️ AuthService: Token generado exitosamente', {
      userId: user.id,
      email: user.email,
      tokenPreview: token.substring(0, 30) + '...',
    });

    // Remover contraseña de la respuesta
    const { password: _, ...userResponse } = user;

    return {
      user: userResponse,
      token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    console.log('🔍 AuthService: Validando usuario con ID:', userId);
    
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true }
      });

      if (user) {
        console.log('✅ AuthService: Usuario válido encontrado:', user.email);
      } else {
        console.log('❌ AuthService: Usuario no encontrado o inactivo para ID:', userId);
      }

      return user;
    } catch (error) {
      console.error('❌ AuthService: Error al validar usuario:', error);
      return null;
    }
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // Tiempo actual en segundos
    };

    console.log('🔧 AuthService: Generando token con payload:', payload);

    try {
      const token = this.jwtService.sign(payload);
      console.log('✅ AuthService: Token firmado exitosamente');
      return token;
    } catch (error) {
      console.error('❌ AuthService: Error al firmar token:', error);
      throw new Error('Error al generar token');
    }
  }

  async createDefaultAdmin(): Promise<void> {
    const adminExists = await this.userRepository.findOne({
      where: { email: 'admin@barranquilla.gov.co' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = this.userRepository.create({
        email: 'admin@barranquilla.gov.co',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        name: 'Administrador Sistema',
        role: 'ADMIN',
        isActive: true,
      });

      await this.userRepository.save(admin);
      console.log('👤 Usuario administrador creado: admin@barranquilla.gov.co / admin123');
    } else {
      console.log('👤 Usuario administrador ya existe');
    }
  }
}