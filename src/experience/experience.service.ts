import { Injectable } from "@nestjs/common";
import { ExperienceDto } from "src/entities/experience.entity";
import { ExperienceNode } from "./entities/ExperienceEntity";
import { ExperienceRepository } from "./experience.repository";

@Injectable()
export class ExperienceService {
    constructor(private readonly experienceRepository: ExperienceRepository) {}

    async create(
        experience: ExperienceDto,
        userId: string,
        poiId: string,
        journeyId: string
    ) {
        const queryResult = await this.experienceRepository.create(
            experience,
            userId,
            poiId,
            journeyId
        );
        const experienceNode = new ExperienceNode(
            queryResult.records[0].get("experience")
        );
        return experienceNode.properties;
    }
}
