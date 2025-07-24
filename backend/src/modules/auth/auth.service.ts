// backend/src/modules/auth/auth.service.ts
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
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generar token
    const token = await this.generateToken(user);

    // Remover contraseña de la respuesta
    const { password: _, ...userResponse } = user;

    return {
      user: userResponse,
      token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
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
    }
  }
}
