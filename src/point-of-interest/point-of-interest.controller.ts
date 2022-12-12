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
    UseInterceptors,
    UseGuards
} from "@nestjs/common";
import { PointOfInterestService } from "./point-of-interest.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "guard/firebase-auth.guard";
import { UserInfo } from "firebase-admin/lib/auth/user-record";

@Controller("poi")
@UseInterceptors(ErrorsInterceptor)
export class PointOfInterestController {
    constructor(
        private readonly pointOfInterestService: PointOfInterestService
    ) {}

    @UseGuards(FirebaseAuthGuard)
    @Post()
    create(
        @Body() createPointOfInterestDto: CreatePointOfInterestDto,
        @Request() req
    ) {
        const user = req.user as UserInfo;
        return this.pointOfInterestService.create(
            user.uid,
            createPointOfInterestDto
        );
    }

    @Get("search/:query")
    findAll(@Param("query") query) {
        const q = JSON.parse(query);
        return this.pointOfInterestService.findAll(
            { lat: q.location.latitude, lng: q.location.longitude },
            q.radius
        );
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.pointOfInterestService.findOne(id);
    }
}
