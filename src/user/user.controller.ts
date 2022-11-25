import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Request,
    UseGuards
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/User.update.dto";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { UserService } from "./user.service";
import { UserInfo } from "@firebase/auth-types";
import { Logger } from "@nestjs/common/services";
@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

    @Get("journeys")
    @UseGuards(FirebaseAuthGuard)
    async getMyJourneys(@Request() req) {
        try {
            const user = req.user as UserInfo;
            const result = await this.userService.getMyJourneys(user.uid);
            return result;
        } catch (er) {
            throw er;
        }
    }

    @Get("/profile")
    @UseGuards(FirebaseAuthGuard)
    async getMyProfile(@Request() req) {
        try {
            const user = req.user as UserInfo;
            const result = await this.userService.getMyProfile(user);
            return result;
        } catch (er) {
            throw er;
        }
    }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getData(@Request() req) {
        try {
            const user = req.user as UserInfo;
            const result = await this.userService.getData(user);
            return result;
        } catch (er) {
            throw er;
        }
    }

    @Put()
    @UseGuards(FirebaseAuthGuard)
    async updateProfile(@Body() newUserData: UpdateUserDto, @Request() req) {
        try {
            const user = req.user as UserInfo;
            const result = await this.userService.updateProfile(
                newUserData,
                user.uid
            );
            return result;
        } catch (er) {
            throw er;
        }
    }

    @Post("/username")
    async checkUser(@Body() user: { username: string }) {
        try {
            return await this.userService.checkUsername(user.username);
        } catch (er) {
            throw er;
        }
    }

    @Get(":username/journeys")
    async getUserJourneys(@Param("username") username: string) {
        try {
            const result = await this.userService.getMyJourneys(username);
            return result;
        } catch (er) {
            throw er;
        }
    }
}
