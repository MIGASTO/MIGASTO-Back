import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private configService: ConfigService) {
        super({
            // Configurar para extraer el token del header Authorization como Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //Configurar para rechazar tokens expirados
            ignoreExpiration: false,
            // Recuperar la clave secreta desde las varibales de entorno
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret_key_123456789'
        })
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            rol: payload.rol,
        };
    }

}