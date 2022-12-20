import { Injectable } from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";

@Injectable()
export class ExperienceRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Create a new experience
     * @param experience The experience to create
     * @param userId The ID of the user creating the experience
     * @param journeyId The ID of the journey the experience is for
     * @param poiId The ID of the POI the experience is for
     * @returns the created experience
     */
    async create(experience: CreateExperienceDto, userId: string) {
        const query = `
            MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $experience.journeyId})
            MATCH (poi:POI {id: $experience.poiId})
            MERGE (experience:Experience{
                id: apoc.create.uuid()
            })
            ON CREATE SET   experience.createdAt = datetime(),
                            experience.title = coalesce($experience.title,'Untitled'),
                            experience.description = coalesce($experience.description, ''),
                            experience.date = coalesce($experience.date , datetime()),
                            experience.images = coalesce($experience.images , [])
            MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
            RETURN experience, user, journey, poi
        `;

        const params = {
            userId,
            experience
        };
        return await this.neo4jService.write(query, params);
    }

    /**
     * Update an experience
     * @param experience The experience to update
     * @param userId the ID of the user updating the experience
     * @return the updated experience
     */
    async update(userId: string, experience: UpdateExperienceDto) {
        const query = `
            MATCH(user:User {uid: $userUid})-[:(CREATED | EXPERIENCE)*0..1]-(experience:Experience:{id: $experience.id})
            SET experience.title = coalesce($experience.title, experience.title),
                experience.description = coalesce($experience.description, experience.description),
                experience.date = coalesce($experience.date, experience.date),
                experience.images = coalesce($experience.images, experience.images)
            RETURN experience
        `;
        const params = {
            userId,
            experience
        };
        return await this.neo4jService.write(query, params);
    }

    /**
     * delete an experience
     * @param userId the user who deletes the experience
     * @param experienceId the experience to be deleted
     */
    async delete(userId: string) {
        const query = `
            MATCH(user:User {uid: $userId})-[:(CREATED | EXPERIENCE)*0..1]-(experience:Experience:{id: $experience.id})
            DETACH DELETE experience
        `;
        const params = {
            userId
        };
        return await this.neo4jService.write(query, params);
    }

    /**
     * Get an experience
     * @param experienceId the ID of the experience to get
     * @returns the experience
     * */
    async findOne(experienceId: string) {
        const query = `
            MATCH (experience:Experience {id: $experienceId})
            RETURN experience
        `;
        const params = {
            experienceId
        };
        return await this.neo4jService.read(query, params);
    }

    /**
     * Create all experiences given in an array
     * @param userId the ID of the user creating the experiences
     * @param journeyId the ID of the journey the experiences are for
     * @param poiId the ID of the POI the experiences are for
     * @param experiences the experiences to create
     * @returns the created experiences
     */
    async createMany(userId: string, experiences: CreateExperienceDto[]) {
        const query = `
                UNWIND $experiences AS experience
                MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: experience.journeyId})
                MATCH (poi:POI {id: experience.poiId})
                MERGE (experience:Experience{
                    id: apoc.create.uuid()
                })
                ON CREATE SET   experience.createdAt = datetime(),
                                experience.title = coalesce(experience.title,'Untitled'),
                                experience.description = coalesce(experience.description, ''),
                                experience.date = coalesce(experience.date , datetime()),
                                experience.images = coalesce(experience.images , [])
                MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
                RETURN experience, user, journey, poi
            `;
        const params = {
            userId,
            experiences
        };
        return await this.neo4jService.write(query, params);
    }
    /**
     * Updates all experiences given in an array
     * @param userId the ID of the user updating the experiences
     * @param experiences the experiences to update
     * @returns the updated experiences
     */
    async updateMany(userId: string, experiences: UpdateExperienceDto[]) {
        const query = `
                UNWIND $experiences AS experience
                MATCH(user:User {uid: $userId})-[:(CREATED | EXPERIENCE)*0..1]-(experience:Experience:{id: experienceId})
                SET experience.title = coalesce(experience.title, experience.title),
                    experience.description = coalesce(experience.description, experience.description),
                    experience.date = coalesce(experience.date, experience.date),
                    experience.images = coalesce(experience.images, experience.images)
                RETURN experience
            `;
        const params = {
            userId,
            experiences
        };
        return await this.neo4jService.write(query, params);
    }

    /**
     * Delete experiences present in an array
     * @param userId the user who deletes the experiences
     * @param experienceIds the experiences to be deleted
     * @returns
     */
    async deleteMany(userId: string, experienceIds: string[]) {
        const query = `
                UNWIND $experienceIds AS experienceId
                MATCH(user:User {uid: $userId})-[:(CREATED | EXPERIENCE)*0..1]-(experience:Experience:{id: experienceId})
                DETACH DELETE experience
            `;
        const params = {
            userId,
            experienceIds
        };
        return await this.neo4jService.write(query, params);
    }
}
