import { Module } from "@nestjs/common";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";
import { JourneyRepository } from "./journey.repository";

@Module({
    providers: [JourneyService, JourneyRepository],
    controllers: [JourneyController],
    exports: [JourneyService]
})
export class JourneyModule {}
