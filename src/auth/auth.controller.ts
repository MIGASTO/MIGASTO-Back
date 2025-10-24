import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';



@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService){}

    @Post('register')
    async registerUser(@Body() user: CreateUsuarioDto){
        return this.authService.registerUser(user)
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto){
        const {email, password} = loginDto
        return this.authService.login(email, password)
    }
}
