import { Module } from "@nestjs/common";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { ExperienceRepository } from "../experience/experience.repository";
import { ExperienceService } from "../experience/experience.service";
import { JourneyRepository } from "./journey.repository";
import { ImageRepository } from "../image/image.repository";

@Module({
    providers: [
        JourneyService,
        JourneyRepository,
        ExperienceRepository,
        ExperienceService,
        ErrorsInterceptor,
        ImageRepository
    ],
    controllers: [JourneyController],
    exports: [JourneyService]
})
export class JourneyModule {}
