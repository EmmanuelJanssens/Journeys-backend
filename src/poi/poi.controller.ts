import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { SearchPoiDto } from "src/data/dtos";
import { AuthenticationGuard } from "src/guard/authentication.guard";
import { PoiService } from "./poi.service";

@Controller("poi")
export class PoiController {
    constructor(private readonly poiService: PoiService) {}

    @Get()
    async getPois(@Query() query: SearchPoiDto) {
        const result = await this.poiService.getPois(
            Number(query.radius),
            Number(query.lat),
            Number(query.lng)
        );
        return result;
    }

    @UseGuards(AuthenticationGuard)
    @Post()
    async createPoi(poiData) {
        const result = await this.poiService.addPoi(poiData);
        return result;
    }

    @UseGuards(AuthenticationGuard)
    @Put()
    async updatePoi(poiData) {
        const result = await this.poiService.updatePoi(poiData);
        return result;
    }

    @Get("/:id")
    async findOne(@Param("id") id: string) {
        const result = await this.poiService.getPoi(id);
        return result;
    }

    @Get("/:id/experiences")
    async findPoiExperiences(@Param("id") id: string) {
        const result = await this.poiService.getPoiExperiences(id, null, 10);
        return result;
    }
}
