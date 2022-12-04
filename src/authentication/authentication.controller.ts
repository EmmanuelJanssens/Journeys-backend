import {
    Controller,
    Post,
    Body,
    BadRequestException,
    HttpCode,
    UseGuards,
    Logger
} from "@nestjs/common";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { User } from "src/model/User";

import { AuthenticationService } from "./authentication.service";
import { RegisterUserDo } from "./dto/RegisterUserDto";
@Controller("authentication")
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) {}

    @Post("login")
    async login(@Body() user) {
        return this.authService.validateUser(user.username);
    }

    @HttpCode(201)
    @Post("register")
    async register(@Body() data: RegisterUserDo) {
        if (data.username == undefined || data.uid == undefined)
            throw new BadRequestException("Fields missing");
        try {
            const result = this.authService.register(data);
            return result;
        } catch (e) {
            Logger.debug(e);
            throw e;
        }
    }

    // @Post("provider")
    // async registerWithProvider(@Body() user: Register) {
    //     try {
    //         const result = await this.authService.registerWithProvider(user);
    //         return result;
    //     } catch (e) {
    //         return undefined;
    //     }
    // }
}
