import { Injectable, Logger } from "@nestjs/common";
import { JourneyRepository } from "./journey.repository";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { Journey, JourneyNode } from "./entities/journey.entity";
import { ExperienceService } from "../experience/experience.service";
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
import { BatchUpdateExperienceDto } from "../experience/dto/batch-update-experience.dto";
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
        private experienceService: ExperienceService,
        private neo4jService: Neo4jService
    ) {}

    getRepository() {
        return this.journeyRepository;
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
        const queryResult = await this.journeyRepository.get(id);

        if (!queryResult.journey) throw new NotFoundError("journey not found");
        if (!queryResult.creator)
            throw new NotFoundError("journey creator not found");
        return {
            journey: queryResult.journey.properties,
            thumbnail: queryResult.thumbnail.properties,
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
        return await session.executeWrite(async (transaction) => {
            const journeyQueryResult = await this.journeyRepository.create(
                user,
                createJourney,
                transaction
            );

            const experiences = await Promise.all(
                createJourney.experiences.map(async (toCreate) => {
                    const created = await this.experienceRepository.create(
                        user,
                        toCreate,
                        journeyQueryResult.journey.id,
                        transaction
                    );
                    return {
                        experience: created.experience.properties,
                        poi: created.poi.properties
                    };
                })
            );

            const images = await Promise.all(
                experiences.map(async (experience) => {
                    const images =
                        await this.imageRepository.createAndConnectImageToExperience(
                            experience.experience.id,
                            transaction
                        );
                    return {
                        experience: experience.experience,
                        images: images.createdImages.map(
                            (img) => img.properties
                        )
                    };
                })
            );
            return {
                createdJourney: journeyQueryResult.journey.properties,
                creator: journeyQueryResult.creator,
                createdExperiences: experiences,
                createdImages: images
            };
        });
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

        const experiences = queryResult.records
            .map((record) => {
                if (record.get("experience") !== null)
                    return {
                        experience: new ExperienceNode(record.get("experience"))
                            .properties as Experience,
                        images: record.get("images").map((imgRec) => {
                            return imgRec.properties;
                        }),
                        poi: new PoiNode(record.get("poi")).properties
                    };
            })
            .filter((exp) => exp !== undefined);

        return {
            ...journey,
            experiences
        };
    }

    /**
     * updates a journey, first find journey and set appropriate fields that have to be
     * updated
     * @param user the user uid that created the journey
     * @param journey the journey to update
     * @returns the updated journey
     */
    async update(user: string, journey: UpdateJourneyDto) {
        const found = await this.findOne(journey.id);
        journey.description = journey.description || found.journey.description;
        journey.title = journey.title || found.journey.title;
        journey.visibility = journey.visibility || found.journey.visibility;

        const session = this.neo4jService.getWriteSession();
        return session
            .executeWrite(async (tx) => {
                //get result of the query
                const queryResult = await this.journeyRepository.update(
                    user,
                    journey,
                    tx
                );

                //create journey node
                const journeyNode = new JourneyNode(
                    queryResult.records[0].get("journey"),
                    []
                );
                const updatedJourney = journeyNode.properties;
                const thumbnails = queryResult.records[0].get("thumbnails");
                const experienceCount = queryResult.records[0].get("count");
                const creator = queryResult.records[0].get("creator");

                //only update if the thumbnail is different
                const thumbnailResult =
                    await this.imageRepository.connectImageToJourney(
                        tx,
                        journey.id,
                        journey.thumbnail
                    );
                let thumbnail;
                if (thumbnailResult.records.length === 0)
                    thumbnail = found.thumbnail;
                else
                    thumbnail = new ImageNode(
                        thumbnailResult.records[0].get("thumbnail")
                    ).properties;

                return {
                    journey: updatedJourney,
                    thumbnail: thumbnail,
                    thumbnails: thumbnails,
                    experiencesCount: experienceCount,
                    creator: creator
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
}
