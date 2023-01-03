import { Injectable } from "@nestjs/common";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { BatchUpdateExperienceDto } from "./dto/batch-update-experience.dto";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { Experience } from "./entities/experience.entity";
import { ExperienceRepository } from "./experience.repository";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageRepository } from "../image/image.repository";
import { Image } from "../image/entities/image.entity";

@Injectable()
export class ExperienceService {
    constructor(
        private readonly experienceRepository: ExperienceRepository,
        private readonly imageRepository: ImageRepository,
        private readonly neo4jService: Neo4jService
    ) {}

    /**
     * find one experience
     * @param experienceId
     * @returns the experience
     */
    async findOne(experienceId: string) {
        const queryResult = await this.experienceRepository.findOne(
            experienceId
        );

        const found = {
            experience: queryResult.experience.properties,
            poi: queryResult.poi.properties,
            journey: queryResult.journey.properties
        };
        return found;
    }

    async create(
        transaction,
        userId: string,
        journeyId: string,
        toCreate: CreateExperienceDto[]
    ) {
        const created = await toCreate.map(async (experience) => {
            const created = await this.experienceRepository.create(
                userId,
                experience,
                journeyId,
                transaction
            );

            if (!created.experience) throw new Error("Experience not created ");

            const imagesAdded =
                await this.imageRepository.createAndConnectImageToExperience(
                    created.experience.id,
                    transaction
                );
            let images = [];
            if (imagesAdded)
                images = imagesAdded.createdImages.map((img) => img.properties);
            return {
                experience: created.experience.properties,
                images,
                poi: created.poi.properties
            };
        });
        return Promise.all(created);
    }

    async update(transaction, userId: string, toUpdate: UpdateExperienceDto[]) {
        const updated = await toUpdate.map(async (experience) => {
            const updated = await this.experienceRepository.update(
                userId,
                experience.id,
                experience,
                transaction
            );
            if (!updated.experience) throw new Error("Experience not updated");
            const exp = updated.experience.properties;
            const imagesAdded =
                await this.imageRepository.createAndConnectImageToExperience(
                    experience.id,
                    transaction
                );

            // if (
            //     experience.images &&
            //     experience.images.length !== imagesAdded.records.length
            // )
            //     throw new Error("Images not created");
            let images = [];
            images = imagesAdded.createdImages.map((img) => img.properties);
            if (experience.removedImages && experience.removedImages.length > 0)
                await this.imageRepository.disconnectImagesFromExperience(
                    experience.id,
                    experience.removedImages,
                    transaction
                );
            return {
                experience: exp,
                images
            };
        });
        return Promise.all(updated);
    }

    async delete(transaction, userId: string, toDelete: string[]) {
        const deleted = await toDelete.map(async (experienceId) => {
            const deletedExps = await this.experienceRepository.delete(
                userId,
                experienceId,
                transaction
            );
            const deleted = deletedExps.experience.properties;
            return {
                experience: deleted
            };
        });
        return Promise.all(deleted);
    }

    async batchUpdate(
        userId: string,
        journeyId: string,
        toUpdate: BatchUpdateExperienceDto
    ) {
        const session = this.neo4jService.getWriteSession();

        let createdExps: {
            experience: Experience;
            poi: PointOfInterest;
            images: Image[];
        }[] = [];
        let updatedExps: {
            experience: Experience;
            images: Image[];
        }[] = [];
        let deletedExps: { experience: Experience }[] = [];
        try {
            if (toUpdate.connected.length > 0)
                createdExps = await session.executeWrite(async (tx) => {
                    return this.create(
                        tx,
                        userId,
                        journeyId,
                        toUpdate.connected
                    );
                });

            if (toUpdate.updated.length > 0)
                updatedExps = await session.executeWrite(async (tx) => {
                    return this.update(tx, userId, toUpdate.updated);
                });

            if (toUpdate.deleted.length > 0)
                deletedExps = await session.executeWrite(async (tx) => {
                    return this.delete(tx, userId, toUpdate.deleted);
                });

            return {
                created: createdExps,
                updated: updatedExps,
                deleted: deletedExps
            };
        } finally {
            session.close();
        }
    }
}
