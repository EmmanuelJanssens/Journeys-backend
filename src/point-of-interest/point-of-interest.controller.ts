import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
    Query,
    UseInterceptors
} from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";

@Controller("poi")
@UseInterceptors(ErrorsInterceptor)
export class PointOfInterestController {
    constructor(
        private readonly pointOfInterestService: PointOfInterestService
    ) {}

    @Post()
    create(
        @Body() createPointOfInterestDto: CreatePointOfInterestDto,
        @Request() req
    ) {
        return this.pointOfInterestService.create(
            "jSvfATtphxUJ5wYsD4JSdqD17fQ2",
            createPointOfInterestDto
        );
    }

    @Get()
    findAll(@Query() query) {
        return this.pointOfInterestService.findAll(
            { lat: Number(query.lat), lng: Number(query.lng) },
            Number(query.radius)
        );
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.pointOfInterestService.findOne(id);
    }
}
