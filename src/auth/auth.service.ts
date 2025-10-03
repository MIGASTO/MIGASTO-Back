import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { Rol } from 'src/user/rol/entity/rol.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(userData: CreateUsuarioDto) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const rol = await this.rolRepository.findOne({ where: { id: userData.rolId } });
    if (!rol) {
      throw new BadRequestException('El Rol especificado no existe');
    }

    const newUser = this.usuarioRepository.create({
      email: userData.email,
      password: hashedPassword,
      rol,
    });

    await this.usuarioRepository.save(newUser);
    return { message: 'Usuario Registrado' };
  }

  async validateUser(email: string, plainPassword: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['rol'],
    });

    if (user && await bcrypt.compare(plainPassword, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(user: any): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email, rol: user.rol.nombre };
    const secret = this.configService.get<string>('JWT_SECRET') || 'fallback_secret_key_123456789';
    return { access_token: this.jwtService.sign(payload, { secret }) };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.rol) {
      throw new BadRequestException('El usuario no tiene un rol asignado');
    }

    return this.generateToken(user);
  }
}
