import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private authService: AuthenticationService) {
        super();
    }

    async validate(userName: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(userName, password);
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
