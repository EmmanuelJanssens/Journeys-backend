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
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { JourneyService } from "./journey.service";
import { ApiBody, ApiCreatedResponse } from "@nestjs/swagger";
import { Journey } from "src/model/Journey";
import { CreateJourneyDto } from "./dto/CreateJourneyDto";
import { UpdateJourneyExperiencesDto } from "./dto/UpdateJourneyExperiencesDto";
import { JourneyExperiences } from "src/model/JourneyExperiences";
import { UpdateJourneyDto } from "./dto/UpdateJourneyDto";
import { Experience } from "src/model/Experience";
@Controller("journey")
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post()
    @ApiCreatedResponse({
        description: "The journey has been successfully created",
        type: Journey
    })
    @ApiBody({ description: "creating a journey", type: CreateJourneyDto })
    async createOne(@Body() body: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.addJourney(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch()
    async updateDetails(
        @Body() body: Journey,
        @Request() req
    ): Promise<UpdateJourneyDto> {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateJourney(body, user.uid);
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":id")
    async deleteJourney(@Param("id") id: string) {
        const res = await this.journeyService.deleteJourney(id);
        return res;
    }

    @Get(":id")
    async getJourneyExperiences(
        @Param("id") id: string
    ): Promise<JourneyExperiences> {
        try {
            const result = await this.journeyService.getJourneyExperiences(id);
            return result;
        } catch (er) {
            throw er;
        }
    }

    @UseGuards(FirebaseAuthGuard)
    @Put(":id/experiences")
    async updateJourneysExperiences(
        @Body() body: UpdateJourneyExperiencesDto,
        @Param("id") id: string,
        @Request() req
    ): Promise<Journey> {
        const user = req.user as UserInfo;

        const res = await this.journeyService.updateJourneyExperiences(
            body,
            user.uid,
            id
        );
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Put(":id/experience/:poi")
    async updateExperience(
        @Body() body: Experience,
        @Param("id") id: string,
        @Param("poi") poi: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.updateExperience(
            body,
            poi,
            id,
            user.uid
        );
        return res;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":id/experience/:poi")
    async removeExperience(
        @Param("id") id: string,
        @Param("poi") poi: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;

        const res = await this.journeyService.removeExperience(
            id,
            poi,
            user.uid
        );
        return res;
    }

    @Put(":id/experience/:poi/image")
    @UseGuards(FirebaseAuthGuard)
    async setImage(
        @Body()
        body: {
            url: string;
        },
        @Param("id") journey: string,
        @Param("poi") poi: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const res = await this.journeyService.setImage(
            journey,
            poi,
            body.url,
            user.uid
        );
        return res;
    }
}
