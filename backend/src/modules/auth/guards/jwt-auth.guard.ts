import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('🛡️ JwtAuthGuard: Verificando autenticación', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'No header',
      url: request.url,
      method: request.method,
    });
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🔍 JwtAuthGuard: Resultado de autenticación', {
      hasUser: !!user,
      hasError: !!err,
      info: info,
      userPreview: user ? user.email : 'No user',
    });

    if (err) {
      console.error('❌ JwtAuthGuard: Error durante autenticación:', err);
      throw err;
    }
    
    if (!user) {
      console.error('❌ JwtAuthGuard: No se encontró usuario válido');
      console.error('❌ JwtAuthGuard: Info adicional:', info);
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
    
    console.log('✅ JwtAuthGuard: Autenticación exitosa para:', user.email);
    return user;
  }
}