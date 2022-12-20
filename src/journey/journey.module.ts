import { Module } from "@nestjs/common";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { ExperienceRepository } from "src/experience/experience.repository";
import { ExperienceService } from "src/experience/experience.service";
import { JourneyRepository } from "./journey.repository";

@Module({
    providers: [
        JourneyService,
        JourneyRepository,
        ExperienceRepository,
        ExperienceService,
        ErrorsInterceptor
    ],
    controllers: [JourneyController],
    exports: [JourneyService]
})
export class JourneyModule {}
