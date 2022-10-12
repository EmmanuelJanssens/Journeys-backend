import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    Request,
    Put
} from "@nestjs/common";
import { ExperienceDto, JourneyDto } from "src/data/dtos";
import { AuthenticationGuard } from "src/guard/authentication.guard";
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

    @UseGuards(AuthenticationGuard)
    @Post()
    async createOne(
        @Body() body: JourneyDto,
        @Request() req
    ): Promise<JourneyDto> {
        const res = await this.journeyService.addJourney(
            body,
            req.user.userName
        );
        return res;
    }

    @UseGuards(AuthenticationGuard)
    @Put()
    async updateOne(
        @Body() body: JourneyDto,
        @Request() req
    ): Promise<JourneyDto> {
        const res = await this.journeyService.updateJourney(
            body,
            req.user.userName
        );
        return res;
    }

    @UseGuards(AuthenticationGuard)
    @Post("experience")
    async addExperience(@Body() body: ExperienceDto, @Request() req) {
        const res = await this.journeyService.addExperience(
            body,
            req.user.username
        );
        return res;
    }

    @UseGuards(AuthenticationGuard)
    @Put("experience")
    async updateExperience(@Body() body: ExperienceDto, @Request() req) {
        const res = await this.journeyService.updateExperience(
            body,
            req.user.username
        );
        return res;
    }
}
