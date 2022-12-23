import { Injectable } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { ImageNode } from "../image/entities/image.entity";
import { Journey, JourneyNode } from "../journey/entities/journey.entity";
import {
    PoiNode,
    PointOfInterest
} from "../point-of-interest/entities/point-of-interest.entity";
import { BatchUpdateExperienceDto } from "./dto/batch-update-experience.dto";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { Experience, ExperienceNode } from "./entities/experience.entity";
import { ExperienceRepository } from "./experience.repository";
import { Image } from "../image/entities/image.entity";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { ImageRepository } from "src/image/image.repository";
import { Logger } from "@nestjs/common/services/logger.service";

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
        const experienceNode = new ExperienceNode(
            queryResult.records[0].get("experience")
        );
        const poiNode = new PoiNode(queryResult.records[0].get("poi"));
        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey")
        );

        const found = {
            experience: experienceNode.properties,
            poi: poiNode.properties,
            journey: journeyNode.properties
        };
        return found;
    }

    async batchUpdate(
        userId: string,
        journeyId: string,
        toUpdate: BatchUpdateExperienceDto
    ) {
        const session = this.neo4jService.getWriteSession();

        try {
            const createdExps = await session
                .executeWrite(async (tx) => {
                    const created = await toUpdate.connected.map(
                        async (experience) => {
                            const created =
                                await this.experienceRepository.create2(
                                    tx,
                                    userId,
                                    experience,
                                    journeyId
                                );
                            const exp = new ExperienceNode(
                                created.records[0].get("experience")
                            ).properties;
                            const poi = new PoiNode(
                                created.records[0].get("poi")
                            ).properties;
                            const imagesAdded =
                                await this.imageRepository.createAndConnectImageToExperience(
                                    tx,
                                    exp.id,
                                    experience.images
                                );
                            const images = imagesAdded.records.map((img) => {
                                return new ImageNode(img.get("image"))
                                    .properties;
                            });
                            return {
                                experience: exp,
                                images,
                                poi
                            };
                        }
                    );
                    return Promise.all(created);
                })
                .catch((err) => {
                    Logger.debug(err);
                    throw Error("Could not create experiences");
                });

            const updatedExps = await session
                .executeWrite(async (tx) => {
                    const updated = await toUpdate.updated.map(
                        async (experience) => {
                            const updated =
                                await this.experienceRepository.update(
                                    tx,
                                    userId,
                                    experience.id,
                                    experience
                                );
                            const exp = new ExperienceNode(
                                updated.records[0].get("experience")
                            ).properties;
                            const addedImages =
                                await this.imageRepository.createAndConnectImageToExperience(
                                    tx,
                                    experience.id,
                                    experience.addedImages
                                );
                            const images = addedImages.records.map((img) => {
                                return new ImageNode(img.get("image"))
                                    .properties;
                            });
                            await this.imageRepository.disconnectImagesFromExperience(
                                tx,
                                experience.id,
                                experience.removedImages
                            );
                            return {
                                experience: exp,
                                images
                            };
                        }
                    );
                    return Promise.all(updated);
                })
                .catch((err) => {
                    Logger.debug(err);
                    throw Error("Could not update experiences");
                });

            const deletedExps = await session
                .executeWrite(async (tx) => {
                    await toUpdate.deleted.forEach(async (experienceId) => {
                        await this.experienceRepository.delete2(
                            tx,
                            userId,
                            experienceId
                        );
                    });
                })
                .catch((err) => {
                    Logger.debug(err);
                    throw Error("Could not delete experiences");
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
