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
        const batch: BatchUpdateExperienceDto = {
            connected: [experience],
            updated: [],
            deleted: []
        };

        const result = await this.experienceService.batchUpdate(
            user.uid,
            journeyId,
            batch
        );

        const poiDto = transformExperienceToDto(
            result.created[0].experience,
            result.created[0].images,
            result.created[0].poi
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
        const batch: BatchUpdateExperienceDto = {
            connected: [],
            updated: [{ ...experience, id: experienceId }],
            deleted: []
        };

        const result = await this.experienceService.batchUpdate(
            user.uid,
            experienceId,
            batch
        );
        const dto = transformExperienceToDto(
            result.updated[0].experience,
            result.updated[0].images
        );
        return dto;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":experienceId")
    delete(@Param("experienceId") experienceId: string, @Request() req) {
        const user = req.user as UserInfo;
        const batch: BatchUpdateExperienceDto = {
            connected: [],
            updated: [],
            deleted: [experienceId]
        };
        return this.experienceService.batchUpdate(user.uid, undefined, batch);
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

        const created = res.created.map((c) => {
            return transformExperienceToDto(c.experience, c.images, c.poi);
        });
        const updated = res.updated.map((u) => {
            return transformExperienceToDto(u.experience, u.images);
        });
        return {
            created,
            updated,
            deleted: res.deleted
        };
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
