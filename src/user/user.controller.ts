import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard("jwt"))
    @Get("journeys")
    async getMyJourneys(@Request() req) {
        const result = await this.userService.getMyJourneys(req.user.username);
        return result;
    }

    @Get(":username/journeys")
    async getUserJourneys(@Param("username") username: string) {
        const result = await this.userService.getMyJourneys(username);
        return result;
    }
}
