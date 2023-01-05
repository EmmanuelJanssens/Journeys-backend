import { Injectable, Logger } from "@nestjs/common";
import { JourneyRepository } from "./journey.repository";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { Journey } from "./entities/journey.entity";
import {
    Experience,
    ExperienceNode
} from "../experience/entities/experience.entity";
import {
    PoiNode,
    PointOfInterest
} from "../point-of-interest/entities/point-of-interest.entity";
import { Integer } from "neo4j-driver";
import { NotFoundError } from "../errors/Errors";
import { ExperienceRepository } from "../experience/experience.repository";
import { Image, ImageNode } from "../image/entities/image.entity";
import { ImageRepository } from "../image/image.repository";
import { Neo4jService } from "../neo4j/neo4j.service";

@Injectable()
export class JourneyService {
    constructor(
        private journeyRepository: JourneyRepository,
        private experienceRepository: ExperienceRepository,
        private imageRepository: ImageRepository,
        private neo4jService: Neo4jService
    ) {}

    getRepository() {
        return this.journeyRepository;
    }
    async transational(target, name, descriptor) {
        const originalMethod = descriptor.value;

        const newMethod = (...args) => {
            console.log("before");
            originalMethod.apply(target, args);
            console.log("after");
        };

        descriptor.value = newMethod;
        return descriptor;
    }

    /**
     * find a journey
     * @param id the journey id
     * @returns a journey dto
     */
    async findOne(id: string): Promise<{
        journey: Journey;
        experiencesCount: Integer;
        thumbnails: Image[];
        thumbnail: Image;
        creator: string;
    }> {
        const queryResult = await this.journeyRepository.findOne(id);

        if (!queryResult.journey) throw new NotFoundError("journey not found");
        if (!queryResult.creator)
            throw new NotFoundError("journey creator not found");
        return {
            journey: queryResult.journey.properties,
            thumbnail: queryResult.thumbnail
                ? queryResult.thumbnail.properties
                : null,
            experiencesCount: queryResult.expCount,
            thumbnails: queryResult.thumbnails.map((img) => img.properties),
            creator: queryResult.creator
        };
    }

    /**
     * create a journey with its optional experiences
     * @param user the user uid that created the journey
     * @param createJourney the journey to create
     * @returns the journey with its experiences
     */
    async createOne(user: string, createJourney: CreateJourneyDto) {
        const session = this.neo4jService.getWriteSession();
        return await session
            .executeWrite(async (transaction) => {
                const journeyQueryResult = await this.journeyRepository.create(
                    user,
                    createJourney,
                    transaction
                );
                if (!journeyQueryResult.journey) {
                    throw new Error("journey not created");
                }
                const experiences = await Promise.all(
                    createJourney.experiences.map(async (toCreate) => {
                        toCreate.addedImages = toCreate.addedImages || [];
                        const experienceQueryResult =
                            await this.experienceRepository.create(
                                user,
                                toCreate,
                                journeyQueryResult.journey.id,
                                transaction
                            );
                        if (!experienceQueryResult.experience) {
                            throw new Error("experience not created");
                        }
                        const images =
                            await this.imageRepository.unwindImagesToRelationships(
                                experienceQueryResult.experience.id,
                                transaction
                            );
                        return {
                            experience:
                                experienceQueryResult.experience.properties,
                            images: images.createdImages.map(
                                (img) => img.properties
                            ),
                            poi: experienceQueryResult.poi.properties
                        };
                    })
                );

                return {
                    createdJourney: journeyQueryResult.journey.properties,
                    creator: journeyQueryResult.creator,
                    createdExperiences: experiences
                };
            })
            .catch((err) => {
                Logger.debug(err.message);
                throw err;
            });
    }

    /**
     * updates a journey, first find journey and set appropriate fields that have to be
     * updated
     * @param user the user uid that created the journey
     * @param journey the journey to update
     * @returns the updated journey
     */
    async update(user: string, journeyId: string, journey: UpdateJourneyDto) {
        const found = await this.findOne(journeyId);
        journey.description = journey.description || found.journey.description;
        journey.title = journey.title || found.journey.title;
        journey.visibility = journey.visibility || found.journey.visibility;

        const session = this.neo4jService.getWriteSession();
        return session
            .executeWrite(async (transaction) => {
                //get result of the query
                const result = await this.journeyRepository.update(
                    user,
                    journeyId,
                    journey,
                    transaction
                );

                //only update if the thumbnail is different
                let thumbnailResult: { thumbnail: ImageNode } = {
                    thumbnail: null
                };
                if (journey.thumbnail)
                    thumbnailResult =
                        await this.imageRepository.connectImageToJourney(
                            journeyId,
                            journey.thumbnail,
                            transaction
                        );
                let thumbnail;
                if (!thumbnailResult.thumbnail) {
                    thumbnail = found.thumbnail;
                } else {
                    thumbnail = thumbnailResult.thumbnail;
                }
                return {
                    journey: result.journey.properties,
                    thumbnail: thumbnail,
                    thumbnails: found.thumbnails,
                    experiencesCount: result.experienceCount,
                    creator: result.creator
                };
            })
            .catch((err) => {
                Logger.debug(err.message);
                throw err;
            });
    }

    /**
     * deletes a journey and its experiences
     * @param user the user uid that created the journey
     * @param journey the journey to delete
     * @returns the deleted journey id
     */
    async delete(user: string, journey: string) {
        const result = await this.journeyRepository.delete(user, journey);
        return result;
    }
    /**
     * get experiences of a journey
     * @param journey_id  the journey id
     * @returns a journey with its experiences
     */
    async getExperiences(journey_id: string): Promise<{
        journey: Journey;
        experiences: {
            experience: Experience;
            images: Image[];
            poi: PointOfInterest;
        }[];
        creator: string;
    }> {
        const journey = await this.findOne(journey_id);
        const queryResult = await this.experienceRepository.findManyByJourneyId(
            journey_id
        );

        const experiences = queryResult.experiences.map((exp) => {
            return {
                experience: exp.experience.properties,
                images: exp.images.map((img) => img.properties),
                poi: exp.poi.properties
            };
        });

        return {
            ...journey,
            experiences
        };
    }
}
