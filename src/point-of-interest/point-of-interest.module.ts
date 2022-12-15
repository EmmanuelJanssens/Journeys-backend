import { Module } from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { PointOfInterestController } from "./point-of-interest.controller";
import { PoiRepository } from "./point-of-interest.repository";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";

@Module({
    controllers: [PointOfInterestController],
    providers: [PointOfInterestService, PoiRepository, ErrorsInterceptor]
})
export class PointOfInterestModule {}
