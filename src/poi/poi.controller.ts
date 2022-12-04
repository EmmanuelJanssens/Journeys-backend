import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
    Request
} from "@nestjs/common";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { PointOfInterest } from "src/model/PointOfInterest";
import { FindPoisArroundDto } from "./dto/SearchPoiDto";
import { PoiService } from "./poi.service";

@Controller("poi")
export class PoiController {
    constructor(private readonly poiService: PoiService) {}

    @Get("search/:query/count")
    async getPoisCountBetween(@Param("query") params: string) {
        const query = JSON.parse(params) as FindPoisArroundDto;
        const result = await this.poiService.getPoisCountBetween(query);
        return result;
    }
    @Get("search/:query")
    async getPoisBetweeen(@Param("query") params: string) {
        const query = JSON.parse(params) as FindPoisArroundDto;
        const result = await this.poiService.getPois(query);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createPoi(@Body() poiData: PointOfInterest, @Request() req) {
        const result = await this.poiService.addPoi(poiData, req.user.uid);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Put()
    async updatePoi(poiData) {
        const result = await this.poiService.updatePoi(poiData);
        return result;
    }

    @Post("/thumbnail")
    async getThumbnail(@Body() poiData: PointOfInterest) {
        const result = await this.poiService.getRandomThumbnail(poiData);
        return result;
    }

    @Get("/:id")
    async findOne(@Param("id") id: string) {
        try {
            const result = await this.poiService.getPoi(id);
            return result;
        } catch (er) {
            throw er;
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
        } catch (er) {
            throw er;
        }
    }
}
