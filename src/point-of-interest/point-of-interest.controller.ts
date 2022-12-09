import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { UpdatePointOfInterestDto } from "./dto/update-point-of-interest.dto";

@Controller("point-of-interest")
export class PointOfInterestController {
    constructor(
        private readonly pointOfInterestService: PointOfInterestService
    ) {}

    @Post()
    create(@Body() createPointOfInterestDto: CreatePointOfInterestDto) {
        return this.pointOfInterestService.create(createPointOfInterestDto);
    }

    @Get()
    findAll() {
        return this.pointOfInterestService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.pointOfInterestService.findOne(+id);
    }

    @Patch(":id")
    update(
        @Param("id") id: string,
        @Body() updatePointOfInterestDto: UpdatePointOfInterestDto
    ) {
        return this.pointOfInterestService.update(
            +id,
            updatePointOfInterestDto
        );
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.pointOfInterestService.remove(+id);
    }
}
