import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Request,
    UseInterceptors,
    UseGuards
} from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { transformPoiToDto } from "../utilities/transformToDto";

@Controller("poi")
@UseInterceptors(ErrorsInterceptor)
export class PointOfInterestController {
    constructor(
        private readonly pointOfInterestService: PointOfInterestService
    ) {}

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async create(
        @Body() createPointOfInterestDto: CreatePointOfInterestDto,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.pointOfInterestService.create(
            user.uid,
            createPointOfInterestDto
        );

        const dto = transformPoiToDto(result.poi, undefined, [], result.tags);
        return dto;
    }

    @Get("search/:query/count")
    async count(@Param("query") query) {
        const q = JSON.parse(query);
        const result = await this.pointOfInterestService.findAll(
            { lat: q.location.latitude, lng: q.location.longitude },
            q.radius
        );
        return result.length;
    }

    @Get("search/:query")
    async findAll(@Param("query") query) {
        const q = JSON.parse(query);
        const result = await this.pointOfInterestService.findAll(
            { lat: q.location.latitude, lng: q.location.longitude },
            q.radius
        );

        const pois = result.map((poi) => {
            const dto = transformPoiToDto(
                poi.poi,
                poi.thumbnails.thumbnails,
                undefined,
                poi.tags,
                poi.expCount
            );
            return dto;
        });
        return pois;
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        const result = await this.pointOfInterestService.findOne(id);
        const dto = transformPoiToDto(
            result.poi,
            [],
            result.experiences,
            result.tags
        );
        return dto;
    }
}
