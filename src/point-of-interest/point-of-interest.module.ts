import { Module } from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { PointOfInterestController } from "./point-of-interest.controller";

@Module({
    controllers: [PointOfInterestController],
    providers: [PointOfInterestService]
})
export class PointOfInterestModule {}
