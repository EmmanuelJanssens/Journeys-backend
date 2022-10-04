import { Module } from "@nestjs/common";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";

@Module({
    providers: [JourneyService],
    controllers: [JourneyController],
    exports: [JourneyService]
})
export class JourneyModule {}
