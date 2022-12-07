import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
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
    async getMyJourneys(@Request() req, @Query() query) {
        try {
            const user = req.user as UserInfo;
            let pages = null;
            let cursor = null;
            console.log(query);
            if (query.pages)
                pages =
                    query.pages == "undefined"
                        ? undefined
                        : Number(query.pages);
            if (query.cursor)
                cursor =
                    query.cursor == "undefined" || query.cursor.length == 0
                        ? null
                        : query.cursor;

            const result = await this.userService.getMyJourneys(
                user.uid,
                pages,
                cursor
            );
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

    @Get("/stats")
    @UseGuards(FirebaseAuthGuard)
    async getMyStats(@Request() req) {
        const user = req.user as UserInfo;
        const result = await this.userService.getStats(user.uid);
        return result;
    }

    @Get("pois")
    @UseGuards(FirebaseAuthGuard)
    async getMyPois(@Request() req) {
        const user = req.user as UserInfo;
        const result = await this.userService.getMyCreatedPois(user.uid);
        return result;
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

    // @Get(":username/journeys")
    // async getUserJourneys(@Param("username") username: string) {
    //     try {
    //         const result = await this.userService.getMyJourneys(username);
    //         return result;
    //     } catch (er) {
    //         throw er;
    //     }
    // }
}
