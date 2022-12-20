import { Injectable } from "@nestjs/common";
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

    /**
     * create experiences from an array
     * @param experiences
     * @param userId
     * @returns the created experiences as an array
     * */
    async createMany(experiences: CreateExperienceDto[], userId: string) {
        const queryResult = await this.experienceRepository.createMany(
            userId,
            experiences
        );
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
        const queryResult = await this.experienceRepository.updateMany(
            userId,
            experiences
        );
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
}
