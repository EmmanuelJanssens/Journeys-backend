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
import { JwtAuthGuard } from "src/guard/jwt-auth.guard";
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

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPoi(poiData) {
        const result = await this.poiService.addPoi(poiData);
        return result;
    }

    @UseGuards(JwtAuthGuard)
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
