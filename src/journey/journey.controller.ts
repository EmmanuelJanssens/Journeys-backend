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
import { ExperienceDto, JourneyDto, UpdateJourneyDto } from "src/data/dtos";
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
import { JourneyService } from "./journey.service";

@Controller("journey")
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get()
    async findAll(@Query() query: any) {
        const pageNumber = Number(query.page) ? Number(query.page) : 0;
        const pageSizeNumber = Number(query.pageSize)
            ? Number(query.ageSize)
            : 10;
        const result = await this.journeyService.getJourneys(
            pageNumber,
            pageSizeNumber
        );
        return result;
    }

    @Get(":id")
    async findOne(
        @Param("id") id: string,
        @Query() query: any
    ): Promise<JourneyDto> {
        const nexp = query.experiences;
        const cursorStr = query.cursor === undefined ? null : query.cursor;
        const result = await this.journeyService.getJourney(
            id,
            cursorStr,
            nexp
        );
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createOne(@Body() body: JourneyDto, @Request() req): Promise<string> {
        console.log(body);
        const res = await this.journeyService.addJourney(
            body,
            req.user.username
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async updateOne(
        @Body() body: UpdateJourneyDto,
        @Request() req
    ): Promise<JourneyDto> {
        const res = await this.journeyService.updateJourneyV2(
            body,
            req.user.username
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Post("experience")
    async addExperience(@Body() body: ExperienceDto, @Request() req) {
        try {
            const res = await this.journeyService.addExperience(
                body,
                req.user.username
            );
            return res;
        } catch (error) {}
    }

    @UseGuards(JwtAuthGuard)
    @Put("experience")
    async updateExperience(@Body() body: ExperienceDto, @Request() req) {
        const res = await this.journeyService.updateExperience(
            body,
            req.user.username
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Patch("experience")
    async removeExperience(@Body() body: ExperienceDto, @Request() req) {
        const res = await this.journeyService.removeExperience(
            body,
            req.user.username
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteJourney(@Param("id") id: string) {
        const res = await this.journeyService.deleteJourney(id);
        return res;
    }
}
