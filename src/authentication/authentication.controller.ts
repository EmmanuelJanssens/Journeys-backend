import {
    Controller,
    Post,
    Body,
    BadRequestException,
    HttpCode
} from "@nestjs/common";
import { UserDto } from "src/data/dtos";

import { AuthenticationService } from "./authentication.service";
import { User } from "@firebase/auth-types";
@Controller("authentication")
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) {}

    @Post("login")
    async login(@Body() user) {
        return this.authService.validateUser(user.username);
    }

    @HttpCode(201)
    @Post("register")
    async register(@Body() data: UserDto) {
        if (data.username == undefined || data.password == undefined)
            throw new BadRequestException("Fields missing");
        try {
            const result = this.authService.register(data);
            return result;
        } catch (e) {
            return undefined;
        }
    }

    @Post("provider")
    async registerWithProvider(@Body() user: User) {
        try {
            const result = await this.authService.registerWithProvider(user);
            return result;
        } catch (e) {
            return undefined;
        }
    }
}
