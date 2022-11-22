import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { PoiDto, SearchPoiDto } from "src/data/dtos";
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
    async createPoi(@Body() poiData: PoiDto) {
        const result = await this.poiService.addPoi(poiData);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    async updatePoi(poiData) {
        const result = await this.poiService.updatePoi(poiData);
        return result;
    }

    @Post("/thumbnail")
    async getThumbnail(@Body() poiData: PoiDto) {
        const result = await this.poiService.getRandomThumbnail(poiData);
        return result;
    }

    @Get("/:id")
    async findOne(@Param("id") id: string) {
        try {
            const result = await this.poiService.getPoi(id);
            return result;
        } catch (e) {
            return undefined;
        }
    }

    @Get("/:id/experiences")
    async findPoiExperiences(@Param("id") id: string) {
        try {
            const result = await this.poiService.getPoiExperiences(
                id,
                null,
                10
            );
            return result;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }
}
