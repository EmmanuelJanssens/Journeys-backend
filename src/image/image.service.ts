import { Injectable } from "@nestjs/common";
import { ImageRepository } from "./image.repository";

@Injectable()
export class ImageService {
    constructor(private readonly imageRepository: ImageRepository) {}

    async connectToExperience(experienceId: string, imageId: string) {
        this.connectToExperience(experienceId, imageId);
    }
}
