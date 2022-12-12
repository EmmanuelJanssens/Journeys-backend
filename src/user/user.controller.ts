import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Delete,
    UseInterceptors,
    UseGuards,
    Query
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { FirebaseAuthGuard } from "guard/firebase-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user-dto";
import { int } from "neo4j-driver";

@Controller("user")
@UseInterceptors(ErrorsInterceptor)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post()
    create(@Body() newUser: UserDto, @Request() req) {
        const user = req.user as UserInfo;
        this.userService.create(newUser, user.uid);
    }

    @Get(":uid/profile")
    findOne(@Param("uid") uid: string) {
        const result = this.userService.findOne(uid);
        return result;
    }

    @Get(":uid/journeys")
    getJourneys(@Param("uid") uid: string, @Query() query) {
        const page = query.page ? int(query.page).subtract(1) : int(0);
        const limit = query.limit ? int(query.limit) : int(300);
        const result = this.userService.getJourneys(uid, page, limit);
        return result;
    }

    @Get(":uid/pois")
    getPois(@Param("uid") uid: string, @Query() query) {
        const page = query.page ? int(query.page).subtract(1) : int(0);
        const limit = query.limit ? int(query.limit) : int(300);
        const result = this.userService.getPois(uid, page, limit);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Get("/journeys")
    getMyJourneys(@Request() req, @Query() query) {
        const user = req.user as UserInfo;
        const page = query.page ? int(query.page).subtract(1) : int(0);
        const limit = query.limit ? int(query.limit) : int(300);
        const result = this.userService.getMyJourneys(user.uid, page, limit);
        return result;
    }
}
