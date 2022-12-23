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
    /**
     * Create a new experience
     * @param experience The experience to create
     * @param userId The ID of the user creating the experience
     * @param journeyId The ID of the journey the experience is for
     * @param poiId The ID of the POI the experience is for
     * @returns the created experience
     *  */
    async create(
        userId: string,
        journeyId: string,
        experienceDto: CreateExperienceDto
    ) {
        const queryResult = await this.experienceRepository.create(
            userId,
            experienceDto,
            journeyId
        );
        const experience = new ExperienceNode(
            queryResult.records[0].get("experience")
        ).properties;
        const poi = new PoiNode(queryResult.records[0].get("poi")).properties;
        const journey = new JourneyNode(queryResult.records[0].get("journey"))
            .properties;
        const images = queryResult.records[0].get("images").map((img) => {
            return new ImageNode(img).properties;
        });
        return {
            experience,
            poi,
            journey,
            images
        };
    }

    /**
     *
     * @param experience
     * @param userId
     * @param experienceId
     * @returns
     */
    async update(
        userId: string,
        experienceId: string,
        updtExperienceDto: UpdateExperienceDto
    ) {
        const session = this.neo4jService.getDriver().session();
        const transactionResult = await session
            .executeWrite(async (tx) => {
                //create experiences
                const updatedExp = await this.experienceRepository.update(
                    tx,
                    userId,
                    experienceId,
                    updtExperienceDto
                );
                //create images
                const createdImages =
                    await this.imageRepository.createAndConnectImageToExperience(
                        tx,
                        experienceId,
                        updtExperienceDto.addedImages
                    );

                //delete images
                const removedImages =
                    await this.imageRepository.disconnectImagesFromExperience(
                        tx,
                        experienceId,
                        updtExperienceDto.removedImages
                    );
                return {
                    updatedExp,
                    createdImages,
                    removedImages
                };
            })
            .catch((err) => {
                Logger.debug(err);
                throw Error("Could not update experience");
            });

        const experience = new ExperienceNode(
            transactionResult.updatedExp.records[0].get("experience")
        ).properties;
        const images = transactionResult.createdImages.records.map((img) => {
            console.log(img);
            return new ImageNode(img.get("image")).properties;
        });
        return {
            experience,
            images
        };
    }

    /**
     *
     * @param userId
     * @param experienceId
     * @returns
     */
    async delete(userId: string, experienceId: string) {
        await this.experienceRepository.delete(userId, experienceId);
        return experienceId;
    }

    /**
     * create experiences from an array
     * @param experiences
     * @param userId
     * @returns the created experiences as an array
     * */
    async createMany(
        userId: string,
        journeyId: string,
        experiences: CreateExperienceDto[]
    ) {
        const queryResult = (await this.experienceRepository.createMany(
            userId,
            journeyId,
            experiences
        )) as QueryResult;

        const experiencesNodes = queryResult.records.map((record) => {
            return {
                experience: new ExperienceNode(record.get("experience"))
                    .properties as Experience,
                poi: new PoiNode(record.get("poi")).properties
            };
        });
        return experiencesNodes;
    }

    /**
     * update experiences from an array
     * @param experiences
     * @param userId
     * @returns the updated experiences as an array
     * */
    async updateMany(experiences: UpdateExperienceDto[], userId: string) {
        const queryResult = (await this.experienceRepository.updateMany(
            userId,
            experiences
        )) as QueryResult;
        const experiencesNodes = queryResult.records.map((record) => {
            return new ExperienceNode(record.get("experience"));
        });
        return experiencesNodes.map((experienceNode) => {
            return experienceNode.properties;
        });
    }

    /**
     * delete experiences from an array
     * @param experiences
     * @param userId
     * @returns the deleted experiences as an array
     * */
    async deleteMany(experiencesId: string[], userId: string) {
        await this.experienceRepository.deleteMany(userId, experiencesId);
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
                            await this.imageRepository.createAndConnectImageToExperience(
                                tx,
                                exp.id,
                                experience.images
                            );
                            return exp;
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
                            await this.imageRepository.createAndConnectImageToExperience(
                                tx,
                                experience.id,
                                experience.addedImages
                            );

                            await this.imageRepository.disconnectImagesFromExperience(
                                tx,
                                experience.id,
                                experience.removedImages
                            );
                            return new ExperienceNode(
                                updated.records[0].get("experience")
                            ).properties;
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
