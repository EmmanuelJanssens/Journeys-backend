import { Module } from "@nestjs/common";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";
import { JourneyRepository } from "./journey.repository";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";

@Module({
    providers: [JourneyService, JourneyRepository, ErrorsInterceptor],
    controllers: [JourneyController],
    exports: [JourneyService]
})
export class JourneyModule {}
