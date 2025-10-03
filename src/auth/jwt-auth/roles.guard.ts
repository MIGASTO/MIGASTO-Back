import { CanActivate, ExecutionContext, UnauthorizedException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()   // 👈 ESTE FALTABA
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.rol) {
      throw new UnauthorizedException('No tienes permisos para acceder a este recurso');
    }

    if (!requiredRoles.includes(user.rol)) {
      throw new UnauthorizedException('No tienes permisos para acceder a este recurso');
    }
    return true;
  }
}
