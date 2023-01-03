import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
    Request,
    Delete,
    Patch,
    UseInterceptors
} from "@nestjs/common";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyService } from "./journey.service";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { Integer } from "neo4j-driver";
import { HttpCode } from "@nestjs/common/decorators";

import {
    transformExperiencesToDto,
    transformJourneyToDto
} from "../utilities/transformToDto";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @HttpCode(200)
    @Get(":journey")
    async findOne(@Param("journey") journey: string) {
        const result = await this.journeyService.findOne(journey);

        const journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            result.thumbnail,
            result.thumbnails,
            result.experiencesCount
        );
        return journeyDto;
    }

    @HttpCode(201)
    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.createOne(user.uid, journey);
        const createdExps = result.createdExperiences;

        const thumbnails = result.createdExperiences
            .map((exp) => exp.images.map((img) => img))
            .reduce((curr, acc) => {
                return [...curr, ...acc];
            }, []);
        //const expDtos = transformExperiencesToDto(createdExps);

        let journeyDto = transformJourneyToDto(
            result.createdJourney,
            result.creator,
            null,
            thumbnails,
            new Integer(createdExps.length)
        );

        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: createdExps.length }

            //experiences: expDtos
        };
        return journeyDto;
    }

    @HttpCode(200)
    @UseGuards(FirebaseAuthGuard)
    @Patch()
    async update(@Body() journey: UpdateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.update(user.uid, journey);

        //concatenate thumnails into one array

        const journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            result.thumbnail,
            result.thumbnails,
            result.experiencesCount
        );

        return journeyDto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":journey")
    async remove(@Param("journey") journey: string, @Request() req) {
        const user = req.user as UserInfo;
        return await this.journeyService.delete(user.uid, journey);
    }

    @Get(":journey/experiences")
    async getExperiences(@Param("journey") journey: string) {
        const result = await this.journeyService.getExperiences(journey);

        let journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            null,
            [],
            new Integer(result.experiences.length)
        );

        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiences.length },
            experiences: transformExperiencesToDto(result.experiences)
        };
        return journeyDto;
    }
}
