import {
    Body,
    Controller,
    Param,
    Patch,
    Request,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { UserInfo } from "firebase-admin/lib/auth/user-record";
import { ErrorsInterceptor } from "src/errors/errors-interceptor.interceptor";
import { FirebaseAuthGuard } from "src/guard/firebase-auth.guard";
import { ImageService } from "./image.service";

@Controller("image")
@UseInterceptors(ErrorsInterceptor)
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @UseGuards(FirebaseAuthGuard)
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body()
        content: {
            original: string;
            thumbnail: string;
        },
        @Request() req
    ) {
        const user = req.user as UserInfo;
        const result = await this.imageService.update(id, content, user.uid);

        return result;
    }
}
