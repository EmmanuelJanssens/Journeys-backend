import { Module } from "@nestjs/common";
import { ImageService } from "./image.service";
import { ImageController } from "./image.controller";
import { ImageRepository } from "./image.repository";

@Module({
    controllers: [ImageController],
    providers: [ImageService, ImageRepository]
})
export class ImageModule {}
