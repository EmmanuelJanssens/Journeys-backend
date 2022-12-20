import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { ErrorsInterceptor } from "src/errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { ExperienceService } from "./experience.service";

@Controller("experience")
@UseInterceptors(ErrorsInterceptor)
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post(":journeyId")
    create(
        @Body() experience: CreateExperienceDto,
        @Param("journeyId") journeyId: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        return this.experienceService.create(user.uid, journeyId, experience);
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":experienceId")
    update(@Body() experience: UpdateExperienceDto, @Request() req) {
        const user = req.user as UserInfo;
        return this.experienceService.update(user.uid, experience);
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":experienceId")
    delete(@Param("experienceId") experienceId: string, @Request() req) {
        const user = req.user as UserInfo;
        return this.experienceService.delete(user.uid, experienceId);
    }
}