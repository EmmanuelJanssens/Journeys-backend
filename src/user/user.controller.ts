import {
    Body,
    Controller,
    Get,
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
            return undefined;
        }
    }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getMyProfile(@Request() req) {
        try {
            const user = req.user as UserInfo;
            console.log(user);
            const result = await this.userService.getMyProfile(user);
            return result;
        } catch (er) {
            return undefined;
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
            return undefined;
        }
    }

    @Post("/username")
    async checkUser(@Body() user: string) {
        try {
            const result = await this.userService.checkUsername(user);
            return result;
        } catch (e) {
            return undefined;
        }
    }

    @Get(":username/journeys")
    async getUserJourneys(@Param("username") username: string) {
        try {
            const result = await this.userService.getMyJourneys(username);
            return result;
        } catch (er) {
            return undefined;
        }
    }
}
