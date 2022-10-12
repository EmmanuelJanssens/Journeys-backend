import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { AuthenticationGuard } from "src/guard/authentication.guard";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthenticationGuard)
    @Get("journeys")
    async getMyJourneys(@Request() req) {
        const result = await this.userService.getMyJourneys(req.user.username);
        return result;
    }
    @UseGuards(AuthenticationGuard)
    @Get("experiences")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async getMyExperiences(@Request() req) {
        const result = await this.userService.getMyExperiences(
            req.user.username
        );
        return result;
    }

    @Get(":username/journeys")
    async getUserJourneys(@Param("username") username: string) {
        const result = await this.userService.getMyJourneys(username);
        return result;
    }

    @Get(":username/experiences")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async getUserExperiences(@Param("username") username: string) {
        const result = await this.userService.getMyExperiences(username);
        return result;
    }
}
