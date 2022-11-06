import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
import { ExperienceDto } from "src/data/dtos";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get("journeys")
    async getMyJourneys(@Request() req) {
        const result = await this.userService.getMyJourneys(req.user.username);
        return result;
    }
    @UseGuards(JwtAuthGuard)
    @Get("experiences")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async getMyExperiences(@Request() req) {
        const result = await this.userService.getMyExperiences(
            req.user.username
        );
        return this.transform(result);
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
        return this.transform(result);
    }

    transform(request) {
        const experiences: ExperienceDto[] = [];
        request.journeys.forEach((el) => {
            el.experiencesConnection.edges.forEach((exp) => {
                delete el.experiencesConnection;
                const data = {
                    title: exp.title,
                    description: exp.description,
                    order: exp.order,
                    images: exp.images,
                    date: exp.date
                };
                experiences.push({
                    poi: exp.node,
                    experience: data,
                    journey: el,
                    id: experiences.length
                });
            });
        });

        return experiences;
    }
}
