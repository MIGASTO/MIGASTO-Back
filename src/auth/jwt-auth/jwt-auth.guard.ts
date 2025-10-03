import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//Extender la clase AuthGuard de passport con la estrategia 'jwt'
//Esto protegera las rutas que usen este guard con la estrategia JWT
export class JwtAuthGuard extends AuthGuard('jwt') {
}