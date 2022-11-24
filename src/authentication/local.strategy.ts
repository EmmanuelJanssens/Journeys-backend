import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { ExtractJwt } from "passport-jwt";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private authService: AuthenticationService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(username: string): Promise<any> {
        try {
            console.log(username);
            const user = await this.authService.validateUser(username);
            return user;
        } catch (e) {
            console.log(e);
        }
    }
}
