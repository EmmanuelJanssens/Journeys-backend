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
