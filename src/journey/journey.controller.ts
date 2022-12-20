import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
    Request,
    Delete,
    Patch,
    UseInterceptors
} from "@nestjs/common";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyService } from "./journey.service";

@Controller("journey")
@UseInterceptors(ErrorsInterceptor)
export class JourneyController {
    constructor(private journeyService: JourneyService) {}

    @Get(":journey")
    async findOne(@Param("journey") journey: string) {
        const result = await this.journeyService.findOne(journey);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createOne(@Body() journey, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.create(user.uid, journey);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Patch()
    async update(@Body() journey: UpdateJourneyDto, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.update(user.uid, journey);
        return result;
    }

    @UseGuards(FirebaseAuthGuard)
    @Delete(":journey")
    async remove(@Param("journey") journey: string, @Request() req) {
        const user = req.user as UserInfo;
        const result = await this.journeyService.delete(user.uid, journey);

        return result;
    }

    @Get(":journey/experiences")
    async getExperiences(@Param("journey") journey: string) {
        const result = await this.journeyService.getExperiences(journey);
        return result;
    }

    // @UseGuards(FirebaseAuthGuard)
    // @Patch(":journey/experience/:poi/image")
    // async updateExperienceImage(
    //     @Param("journey") journey: string,
    //     @Param("poi") poi: string,
    //     @Body() image: { url: string },
    //     @Request() req
    // ) {
    //     const user = req.user as UserInfo;
    //     const result = await this.journeyService.pushImageToExperience(
    //         user.uid,
    //         journey,
    //         poi,
    //         image.url
    //     );
    //     return result;
    // }
}
