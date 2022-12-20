import { Injectable } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { Journey, JourneyNode } from "src/journey/entities/journey.entity";
import { Neo4jService } from "src/neo4j/neo4j.service";
import {
    PoiNode,
    PointOfInterest
} from "src/point-of-interest/entities/point-of-interest.entity";
import { BatchUpdateExperienceDto } from "./dto/batch-update-experience.dto";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import {
    Experience,
    ExperienceDto,
    ExperienceNode
} from "./entities/experience.entity";
import { ExperienceRepository } from "./experience.repository";

@Injectable()
export class ExperienceService {
    constructor(
        private readonly experienceRepository: ExperienceRepository,
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
            poi: poiNode.getProperties() as PointOfInterest,
            journey: journeyNode.getProperties() as Journey
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
        experience: CreateExperienceDto
    ) {
        const queryResult = await this.experienceRepository.create(
            userId,
            experience,
            journeyId
        );
        const experienceNode = new ExperienceNode(
            queryResult.records[0].get("experience")
        );
        return experienceNode.properties;
    }

    /**
     *
     * @param experience
     * @param userId
     * @param experienceId
     * @returns
     */
    async update(userId: string, experience: UpdateExperienceDto) {
        const queryResult = await this.experienceRepository.update(
            userId,
            experience
        );
        const experienceNode = new ExperienceNode(
            queryResult.records[0].get("experience")
        );
        return experienceNode.properties;
    }

    /**
     *
     * @param userId
     * @param experienceId
     * @returns
     */
    async delete(userId: string, experienceId: string) {
        await this.experienceRepository.delete(userId);
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
            return new ExperienceNode(record.get("experience"));
        });
        return experiencesNodes.map((experienceNode) => {
            return experienceNode.properties;
        });
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
