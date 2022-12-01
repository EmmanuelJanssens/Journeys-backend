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
    Patch,
    Logger,
    Req
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
import { ApiCreatedResponse } from "@nestjs/swagger";
import { Journey } from "src/model/Journey";
import { CreateJourneyDto } from "./dto/CreateJourneyDto";
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
        } catch (er) {
            throw er;
        }
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    @ApiCreatedResponse({
        description: "The journey has been successfully created",
        type: Journey
    })
    async createOne(@Body() body: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.addJourney(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Put("/experiences/:id")
    async updateOne(
        @Body() body: UpdateJourneyDto,
        @Param("id") id: string,
        @Request() req
    ): Promise<JourneyDto> {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateJourneyV2(
            body,
            user.uid,
            id
        );
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch()
    async updateDetails(
        @Body() body: JourneyDto,
        @Request() req
    ): Promise<JourneyDto> {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateJourneys(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post("id/experience")
    async addExperience(
        @Body() body: ExperienceDto,
        @Param("id") id: string,
        @Request() req
    ) {
        try {
            const user = req.user as UserInfo;

            const res = await this.journeyService.addExperience(
                body,
                user.uid,
                id
            );
            return res;
        } catch (er) {
            throw er;
        }
    }

    @UseGuards(FirebaseAuthGuard)
    @Put(":id/experience")
    async updateExperience(
        @Body() body: ExperienceDto,
        @Param("id") id: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.updateExperience(
            body,
            user.uid,
            id
        );
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":id/experience")
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

    @Put("experience/image")
    @UseGuards(FirebaseAuthGuard)
    async setImage(
        @Body()
        body: {
            journey: string;
            poi: string;
            url: string;
        },
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.setImage(body, user.uid);
        return res;
    }
}
