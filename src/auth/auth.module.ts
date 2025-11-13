import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Rol } from 'src/user/rol/entity/rol.entity';
import { PerfilUsuario } from 'src/user/perfil/entity/perfil_usuario.entity';


@Module({
  imports:[
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key_123456789',
        signOptions: { expiresIn: '30m' },
      }),
    }),
    TypeOrmModule.forFeature([Usuario, Rol,PerfilUsuario])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
