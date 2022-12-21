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
import { PointToLocation } from "src/entities/utilities";
import { JourneyDto } from "./dto/journey.dto";
import { Point } from "neo4j-driver";
import { ExperienceDto } from "src/experience/entities/experience.entity";
import { PointOfInterestDto } from "src/point-of-interest/dto/point-of-interest.dto";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get(":journey")
    async findOne(@Param("journey") journey: string) {
        const result = await this.journeyService.findOne(journey);

        //concatenate thumnails into one array
        const thumbnails = result.thumbnails.reduce(
            (acc, curr) => [...acc, ...curr],
            []
        );
        //get proper form for display
        const start = PointToLocation(result.journey.start as Point);
        const end = PointToLocation(result.journey.end as Point);

        //build final dto
        const dto: JourneyDto = {
            ...result.journey,
            experiencesAggregate: { count: result.experiencesCount.low },
            thumbnails
        };
        dto.start = start;
        dto.end = end;
        return dto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey: CreateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.create(user.uid, journey);

        const thumbnails = result.experiences.reduce(
            (acc, curr) => [...acc, ...curr.experience.images],
            []
        );

        const expDtos = result.experiences.map((exp) => {
            const poiDto = {
                id: exp.poi.id,
                name: exp.poi.name,
                location: PointToLocation(exp.poi.location as Point)
            };
            const dto: ExperienceDto = {
                title: exp.experience.title,
                description: exp.experience.description,
                images: exp.experience.images,
                date: new Date(exp.experience.date).toISOString() as any,
                poi: poiDto as PointOfInterestDto
            };
            return dto;
        });

        //get proper form for display
        const start = PointToLocation(result.journey.start as Point);
        const end = PointToLocation(result.journey.end as Point);

        const dto: JourneyDto = {
            ...result.journey,
            experiences: expDtos,
            experiencesAggregate: { count: result.experiences.length },
            thumbnails
        };
        dto.start = start;
        dto.end = end;

        return dto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch()
    async update(@Body() journey: UpdateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.update(user.uid, journey);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":journey")
    async remove(@Param("journey") journey: string, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.delete(user.uid, journey);

        return result;
    }

    @Get(":journey/experiences")
    async getExperiences(@Param("journey") journey: string) {
        const result = await this.journeyService.getExperiences(journey);
        return result;
    }

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
