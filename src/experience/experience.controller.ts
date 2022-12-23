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
import { Get } from "@nestjs/common/decorators";
import { HttpCode } from "@nestjs/common/decorators/http/http-code.decorator";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { transformExperienceToDto } from "../utilities/transformToDto";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { BatchUpdateExperienceDto } from "./dto/batch-update-experience.dto";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { ExperienceService } from "./experience.service";

@Controller("experience")
@UseInterceptors(ErrorsInterceptor)
export class ExperienceController {
    constructor(private readonly experienceService: ExperienceService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post(":journeyId")
    async create(
        @Body() experience: CreateExperienceDto,
        @Param("journeyId") journeyId: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.experienceService.create(
            user.uid,
            journeyId,
            experience
        );

        const poiDto = transformExperienceToDto(
            result.experience,
            result.images,
            result.poi
        );
        return poiDto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch(":experienceId")
    async update(
        @Body() experience: UpdateExperienceDto,
        @Param("experienceId") experienceId: string,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.experienceService.update(
            user.uid,
            experienceId,
            experience
        );
        const dto = transformExperienceToDto(result.experience, result.images);
        return dto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":experienceId")
    delete(@Param("experienceId") experienceId: string, @Request() req) {
        const user = req.user as UserInfo;
        return this.experienceService.delete(user.uid, experienceId);
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch("edit/:journeyId")
    async batchUpdate(
        @Body() experiences: BatchUpdateExperienceDto,
        @Param("journeyId") journeyId,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const res = await this.experienceService.batchUpdate(
            user.uid,
            journeyId,
            experiences
        );
        return res;
    }

    @HttpCode(200)
    @Get(":experienceId")
    async getOne(@Param("experienceId") experienceId: string) {
        const result = await this.experienceService.findOne(experienceId);
        const dto = transformExperienceToDto(
            result.experience,
            [],
            result.poi,
            result.journey
        );

        return dto;
    }
}
