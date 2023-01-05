import { Injectable } from "@nestjs/common";
import { ImageRepository } from "./image.repository";

@Injectable()
export class ImageService {
    constructor(private readonly imageRepository: ImageRepository) {}

    async connectToExperience(experienceId: string, imageId: string) {
        this.connectToExperience(experienceId, imageId);
    }

    async update(
        id: string,
        content: { url: string; thumbnail: string },
        userId: string
    ) {
        const result = await this.imageRepository.setImageFileUrl(
            id,
            userId,
            content
        );
        const image = result.image.properties;
        return image;
    }
}
