import { Injectable } from "@nestjs/common";
import { ExperienceDto } from "src/entities/experience.entity";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { ExperienceNode } from "./entities/experience.entity";
import { ExperienceRepository } from "./experience.repository";

@Injectable()
export class ExperienceService {
    constructor(private readonly experienceRepository: ExperienceRepository) {}

    /**
     * Create a new experience
     * @param experience The experience to create
     * @param userId The ID of the user creating the experience
     * @param journeyId The ID of the journey the experience is for
     * @param poiId The ID of the POI the experience is for
     * @returns the created experience
     *  */
    async create(experience: CreateExperienceDto, userId: string) {
        const queryResult = await this.experienceRepository.create(
            experience,
            userId
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
    async update(experience: UpdateExperienceDto, userId: string) {
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
}
