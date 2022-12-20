import { Injectable } from "@nestjs/common";
import { ExperienceDto } from "src/entities/experience.entity";
import { Neo4jService } from "src/neo4j/neo4j.service";

@Injectable()
export class ExperienceRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Create a new experience
     * @param experience The experience to create
     * @param userId The ID of the user creating the experience
     * @param journeyId The ID of the journey the experience is for
     * @param poiId The ID of the POI the experience is for
     * @returns The ID of the created experience
     */
    async create(
        experience: ExperienceDto,
        userId: string,
        poiId: string,
        journeyId: string
    ) {
        const query = `
            MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
            MATCH (poi:POI {id: $poiId})
            MERGE (experience:Experience{
                id: $journeyId + '-' + $poiId
            })
            ON CREATE SET   experience.createdAt = datetime(),
                            experience.title = coalesce($experience.title,'Untitled'),
                            experience.description = coalesce($experience.description, ''),
                            experience.date = coalesce($experience.date , datetime()),
                            experience.images = coalesce($experience.images , [])
            ON MATCH SET experience.updatedAt = datetime()
            MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
            RETURN experience, user, journey, poi
        `;

        const params = {
            userId,
            poiId,
            journeyId,
            experience
        };
        return await this.neo4jService.write(query, params);
    }
}
