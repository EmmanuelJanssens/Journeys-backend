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

    @Post("/test/connect/:exp/")
    async connectTest(
        @Param("exp") exp: string,
        @Body() body: { images: string[] }
    ): Promise<any> {
        await this.journeyService.test(exp, body.images);
    }

    @HttpCode(200)
    @Get(":journey")
    async findOne(@Param("journey") journey: string) {
        const result = await this.journeyService.findOne(journey);

        //concatenate thumnails into one array
        const thumbnails = result.thumbnails.reduce(
            (acc, curr) => [...acc, ...curr],
            []
        );

        const journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            thumbnails,
            result.experiencesCount
        );
        return journeyDto;
    }

    @HttpCode(201)
    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.create(user.uid, journey);
        const createdExps = result.experiences.created;
        const thumbnails = createdExps.reduce(
            (acc, curr) => [...acc, ...curr.experience.images],
            []
        );

        const expDtos = transformExperiencesToDto(createdExps);

        let journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            thumbnails,
            new Integer(createdExps.length)
        );

        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: createdExps.length },
            thumbnails,
            experiences: expDtos
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
        const thumbnails = result.thumbnails.reduce(
            (acc, curr) => [...acc, ...curr],
            []
        );

        const journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            thumbnails,
            result.experiencesCount
        );

        return journeyDto;
    }

    @HttpCode(204)
    @UseGuards(FirebaseAuthGuard)
    @Delete(":journey")
    async remove(@Param("journey") journey: string, @Request() req) {
        const user = req.user as UserInfo;
        await this.journeyService.delete(user.uid, journey);
    }

    @Get(":journey/experiences")
    async getExperiences(@Param("journey") journey: string) {
        const result = await this.journeyService.getExperiences(journey);

        //get thumbnails from experiences
        const thumbnails = result.experiences.reduce(
            (acc, curr) => [...acc, ...curr.experience.images],
            []
        );

        let journeyDto = transformJourneyToDto(
            result.journey,
            result.creator,
            thumbnails,
            new Integer(result.experiences.length)
        );

        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiences.length },
            experiences: transformExperiencesToDto(result.experiences),
            thumbnails
        };
        return journeyDto;
    }

    //TODO move to experience controller
    // @UseGuards(FirebaseAuthGuard)
    // @Patch(":journey/experience/:poi/image")
    // async updateExperienceImage(
    //     @Param("journey") journey: string,
    //     @Param("poi") poi: string,
    //     @Body() image: { url: string },
    //     @Request() req
    // ) {
    //     const user = req.user as UserInfo;
    //     const result = await this.journeyService.pushImageToExperience(
    //         user.uid,
    //         journey,
    //         poi,
    //         image.url
    //     );
    //     return result;
    // }
}
