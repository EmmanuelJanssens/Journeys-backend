import {
    Controller,
    Request,
    Post,
    UseGuards,
    Body,
    BadRequestException,
    HttpCode
} from "@nestjs/common";
import { UserDto } from "src/dto/dtos";
import { LocalAuthGuard } from "src/guard/local-auth.guard";
import { AuthenticationService } from "./authentication.service";

@Controller("authentication")
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) {}

    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(@Request() req) {
        return req.user;
    }

    @HttpCode(201)
    @Post("register")
    async register(@Body() data: UserDto) {
        if (data.username == undefined || data.password == undefined)
            throw new BadRequestException("Fields missing");
        const result = this.authService.register(data);
        return result;
    }
}
