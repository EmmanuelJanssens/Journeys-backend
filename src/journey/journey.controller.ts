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
import { Experience, ExperienceDto } from "../entities/experience.entity";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { EditJourneyExperiencesDto } from "./dto/edit-journey-dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyService } from "./journey.service";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get(":journey")
    async findOne(@Param("journey") journey: string) {
        const result = await this.journeyService.findOne(journey);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.create(user.uid, journey);
        return result;
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

    @UseGuards(FirebaseAuthGuard)
    @Post(":journey/experiences")
    async addExperiences(
        @Param("journey") journey: string,
        @Body()
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[],
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.addExperiences(
            user.uid,
            journey,
            experiences
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":journey/experiences")
    async updateJourneysExperiences(
        @Param("journey") journey: string,
        @Body() editDto: EditJourneyExperiencesDto,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = this.journeyService.editJourneysExperiences(
            user.uid,
            journey,
            editDto
        );
        return result;
    }
    @Get(":journey/experience/:poi")
    async getExperience(
        @Param("journey") journey: string,
        @Param("poi") poi: string
    ) {
        const result = await this.journeyService.getExperience(journey, poi);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post(":journey/experience/:poi")
    async addExperience(
        @Param("journey") journey: string,
        @Param("poi") poi: string,
        @Body() experience: Experience,
        @Request() req
    ) {
        const user = req.user as UserInfo;

        const result = await this.journeyService.addExperience(
            user.uid,
            journey,
            poi,
            experience
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":journey/experience/:poi")
    async updateExperience(
        @Param("journey") journey: string,
        @Param("poi") poi: string,
        @Body() experience: ExperienceDto,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.updateExperience(
            user.uid,
            journey,
            poi,
            experience
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":journey/experience/:poi")
    async removeExperience(
        @Param("journey") journey: string,
        @Param("poi") poi: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.deleteExperience(
            user.uid,
            journey,
            poi
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":journey/experience/:poi/image")
    async updateExperienceImage(
        @Param("journey") journey: string,
        @Param("poi") poi: string,
        @Body() image: { url: string },
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.pushImageToExperience(
            user.uid,
            journey,
            poi,
            image.url
        );
        return result;
    }
}
