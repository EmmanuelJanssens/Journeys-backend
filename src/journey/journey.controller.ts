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
import { UserInfo } from "@firebase/auth-types";
import {
    DeleteExperience,
    ExperienceDto,
    JourneyDto,
    UpdateJourneyDto
} from "src/data/dtos";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
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
        try {
            const result = await this.journeyService.getJourney(
                id,
                cursorStr,
                nexp
            );
            return result;
        } catch (e) {}
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() body: JourneyDto, @Request() req): Promise<string> {
        const user = req.user as UserInfo;
        const res = await this.journeyService.addJourney(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Put()
    async updateOne(
        @Body() body: UpdateJourneyDto,
        @Request() req
    ): Promise<JourneyDto> {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateJourneyV2(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post("experience")
    async addExperience(@Body() body: ExperienceDto, @Request() req) {
        try {
            const user = req.user as UserInfo;

            const res = await this.journeyService.addExperience(body, user.uid);
            return res;
        } catch (error) {}
    }

    @UseGuards(FirebaseAuthGuard)
    @Put("experience")
    async updateExperience(@Body() body: ExperienceDto, @Request() req) {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateExperience(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch("experience")
    async removeExperience(@Body() body: DeleteExperience, @Request() req) {
        const user = req.user as UserInfo;

        const res = await this.journeyService.removeExperience(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":id")
    async deleteJourney(@Param("id") id: string) {
        const res = await this.journeyService.deleteJourney(id);
        return res;
    }
}
