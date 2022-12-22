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

@Injectable()
export class ExperienceService {
    constructor(private readonly experienceRepository: ExperienceRepository) {}

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

        return {
            experience,
            poi,
            journey
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
        const queryResult = await this.experienceRepository.update(
            userId,
            experienceId,
            updtExperienceDto
        );
        const experience = new ExperienceNode(
            queryResult.records[0].get("experience")
        ).properties;
        const images: Image[] = queryResult.records[0]
            .get("images")
            .map((image) => {
                return new ImageNode(image).properties;
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
        await this.experienceRepository.batchUpdate(
            userId,
            journeyId,
            toUpdate
        );
    }
}
