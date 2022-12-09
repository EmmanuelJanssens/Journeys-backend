import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    Request,
    Put,
    Delete,
    Patch
} from "@nestjs/common";
import { Experience } from "src/entities/experience.entity";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";
import { JourneyService } from "./journey.service";

@Controller("journey")
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get(":id")
    async findOne(@Param("id") id: string) {
        console.log(id);
        const result = await this.journeyService.findOne(id);
        return result;
    }

    @Post()
    async createOne(@Body() journey, @Request() req) {
        const result = await this.journeyService.create(
            "jSvfATtphxUJ5wYsD4JSdqD17fQ2",
            journey
        );
        return result;
    }

    @Patch()
    async update(@Body() journey, @Request() req) {
        const result = await this.journeyService.update(
            "jSvfATtphxUJ5wYsD4JSdqD17fQ2",
            journey
        );
        return result;
    }

    @Delete(":id")
    async remove(@Param("id") id: string, @Request() req) {
        const result = await this.journeyService.delete(
            "jSvfATtphxUJ5wYsD4JSdqD17fQ2",
            id
        );

        return result;
    }

    @Get(":id/experiences")
    async getExperiences(@Param("id") id: string) {
        const result = await this.journeyService.getExperiences("", id);
        return result;
    }

    @Post(":id/experiences")
    async addExperiences(
        @Param("id") id: string,
        @Body()
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[]
    ) {
        console.log(experiences);
        const result = await this.journeyService.addExperiences(
            id,
            experiences
        );
        return result;
    }

    @Post(":id/experience/:poi")
    async addExperience(
        @Param("id") id: string,
        @Param("poi") poi: string,
        @Body() experience: Experience,
        @Request() req
    ) {
        const result = await this.journeyService.addExperience(
            "jSvfATtphxUJ5wYsD4JSdqD17fQ2",
            id,
            poi,
            experience
        );
        return result;
    }

    @Get(":id/experience/:poi")
    async getExperience(@Param("id") id: string, @Param("poi") poi: string) {
        const result = await this.journeyService.getExperience(id, poi);
        return result;
    }
}
