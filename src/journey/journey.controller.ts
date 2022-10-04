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
import { AuthGuard } from "@nestjs/passport";
import { JourneyDto } from "src/dto/dtos";
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
    async createOne(@Body() body: any, @Request() req): Promise<JourneyDto> {
        const res = await this.journeyService.addJourney(
            body,
            req.user.userName
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async updateOne(@Body() body: any, @Request() req): Promise<JourneyDto> {
        const res = await this.journeyService.updateJourney(
            body,
            req.user.userName
        );
        return res;
    }

    @UseGuards(JwtAuthGuard)
    @Post("experience")
    async addExperience(@Body() body: any, @Request() req) {
        const res = await this.journeyService.addExperience(
            body,
            req.user.username
        );
        return res;
    }
}
