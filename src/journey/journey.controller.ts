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
import { Experience, ExperienceDto } from "entities/experience.entity";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { FirebaseAuthGuard } from "guard/firebase-auth.guard";
import { PointOfInterest } from "point-of-interest/entities/point-of-interest.entity";
import { EditJourneyExperiencesDto } from "./dto/edit-journey-dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyService } from "./journey.service";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get(":id")
    async findOne(@Param("id") id: string) {
        const result = await this.journeyService.findOne(id);
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
    @Delete(":id")
    async remove(@Param("id") id: string, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.delete(user.uid, id);

        return result;
    }

    @Get(":id/experiences")
    async getExperiences(@Param("id") id: string) {
        const result = await this.journeyService.getExperiences(id);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post(":id/experiences")
    async addExperiences(
        @Param("id") id: string,
        @Body()
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[]
    ) {
        const result = await this.journeyService.addExperiences(
            id,
            experiences
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":id/experiences")
    async updateJourneysExperiences(
        @Param("id") id: string,
        @Body() editDto: EditJourneyExperiencesDto,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = this.journeyService.editJourneysExperiences(
            user.uid,
            id,
            editDto
        );
        return result;
    }
    @Get(":id/experience/:poi")
    async getExperience(@Param("id") id: string, @Param("poi") poi: string) {
        const result = await this.journeyService.getExperience(id, poi);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post(":id/experience/:poi")
    async addExperience(
        @Param("id") id: string,
        @Param("poi") poi: string,
        @Body() experience: Experience,
        @Request() req
    ) {
        const user = req.user as UserInfo;

        const result = await this.journeyService.addExperience(
            user.uid,
            id,
            poi,
            experience
        );
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":id/experience/:poi")
    async updateExperience(
        @Param("id") id: string,
        @Param("poi") poi: string,
        @Body() experience: ExperienceDto
    ) {
        const result = await this.journeyService.updateExperience(
            id,
            poi,
            experience
        );
        return result;
    }
}
