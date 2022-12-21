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
import { JourneyDto } from "./dto/journey.dto";
import { Point } from "neo4j-driver";
import { Experience } from "../experience/entities/experience.entity";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { HttpCode } from "@nestjs/common/decorators";
import { Journey } from "./entities/journey.entity";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { ExperienceDto } from "src/experience/dto/experience.dto";
import { Locality } from "../utilities/Locality";
import { PointToLocation } from "../utilities/transformToDto";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    transformJourneyToDto(journey: Journey, creator: string) {
        const dto: JourneyDto = {
            id: journey.id,
            title: journey.title,
            description: journey.description,
            start: PointToLocation(journey.start as Point) as Locality,
            end: PointToLocation(journey.end as Point) as Locality,
            visibility: journey.visibility,
            thumbnail: journey.thumbnail,
            creator
        };
        return dto;
    }

    transformExperiencesToDto(
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[]
    ) {
        const expDtos = experiences.map((exp) => {
            const poiDto = {
                id: exp.poi.id,
                name: exp.poi.name,
                location: PointToLocation(exp.poi.location as Point)
            };
            const dto: ExperienceDto = {
                id: exp.experience.id,
                title: exp.experience.title,
                description: exp.experience.description,
                images: exp.experience.images,
                date: new Date(exp.experience.date).toISOString() as any,
                poi: poiDto as PointOfInterestDto
            };
            return dto;
        });
        return expDtos;
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

        let journeyDto = this.transformJourneyToDto(
            result.journey,
            result.creator
        );
        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiencesCount.low },
            thumbnails
        };
        return journeyDto;
    }

    @HttpCode(201)
    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.create(user.uid, journey);

        const thumbnails = result.experiences.reduce(
            (acc, curr) => [...acc, ...curr.experience.images],
            []
        );

        const expDtos = this.transformExperiencesToDto(result.experiences);

        let journeyDto = this.transformJourneyToDto(
            result.journey,
            result.creator
        );

        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiences.length },
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

        let journeyDto = this.transformJourneyToDto(
            result.journey,
            result.creator
        );

        //build final dto
        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiencesCount.low },
            thumbnails
        };

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
        let journeyDto = this.transformJourneyToDto(
            result.journey,
            result.creator
        );

        //get thumbnails from experiences
        const thumbnails = result.experiences.reduce(
            (acc, curr) => [...acc, ...curr.experience.images],
            []
        );
        journeyDto = {
            ...journeyDto,
            experiencesAggregate: { count: result.experiences.length },
            experiences: this.transformExperiencesToDto(result.experiences),
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
