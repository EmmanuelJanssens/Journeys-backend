import {
    Controller,
    Request,
    Post,
    UseGuards,
    Body,
    BadRequestException,
    HttpCode,
    Get,
    Req,
    Put
} from "@nestjs/common";
import { UserDto } from "src/data/dtos";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
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

    @UseGuards(JwtAuthGuard)
    @Get("logout")
    async logout(@Request() req) {
        if (!this.authService.logoutUser(req.user.username))
            throw new Error("Something went wrong");

        return { msg: "Loggedout" };
    }

    @UseGuards(JwtAuthGuard)
    @Get("refresh")
    async refresh(@Request() req) {
        return this.authService.refreshToken(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Put("update")
    async updatePassword(
        @Body()
        body: { oldPassword: string; newPassword: string; public: boolean },
        @Request() req
    ) {
        try {
            const res = await this.authService.updatePasswords(
                body,
                req.user.username
            );
            console.log(res);
            return res;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }
}
