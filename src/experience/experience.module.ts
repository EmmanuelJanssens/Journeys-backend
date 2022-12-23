import { Module } from "@nestjs/common";
import { ExperienceService } from "./experience.service";
import { ExperienceController } from "./experience.controller";
import { ExperienceRepository } from "./experience.repository";
import { ImageRepository } from "src/image/image.repository";

@Module({
    controllers: [ExperienceController],
    providers: [ExperienceService, ExperienceRepository, ImageRepository]
})
export class ExperienceModule {}
