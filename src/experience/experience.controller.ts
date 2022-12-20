import {
    Body,
    Controller,
    Param,
    Post,
    Request,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { ErrorsInterceptor } from "src/errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { ExperienceService } from "./experience.service";

@Controller("experience")
@UseInterceptors(ErrorsInterceptor)
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post()
    create(@Body() experience: CreateExperienceDto, @Request() req) {
        const user = req.user as UserInfo;
        return this.experienceService.create(experience, user.uid);
    }
}
