import { Injectable } from "@nestjs/common";
import { Neo4jService } from "../neo4j/neo4j.service";
import { BatchUpdateExperienceDto } from "./dto/batch-update-experience.dto";
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
    async create(
        userId: string,
        experience: CreateExperienceDto,
        journeyId: string
    ) {
        const query = `
            MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
            MATCH (poi:POI {id: $experience.poi})
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
            journeyId,
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
    async update(
        userId: string,
        experienceId: string,
        experience: UpdateExperienceDto
    ) {
        const query = `
            MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id : $experienceId})
            SET experience.title = coalesce($experience.title, experience.title),
                experience.description = coalesce($experience.description, experience.description),
                experience.date = coalesce($experience.date, experience.date),
                experience.images = coalesce($experience.images, experience.images)
            RETURN experience
        `;
        const params = {
            userId,
            experienceId,
            experience
        };
        return await this.neo4jService.write(query, params);
    }

    /**
     * delete an experience
     * @param userId the user who deletes the experience
     * @param experienceId the experience to be deleted
     */
    async delete(userId: string, experienceId: string) {
        const query = `
            MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id: $experienceId})
            DETACH DELETE experience
        `;
        const params = {
            userId,
            experienceId
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
            OPTIONAL MATCH (journey:Journey)-[:EXPERIENCE]->(experience:Experience {id: $experienceId})-[:FOR]->(poi:POI)
            RETURN experience, poi, journey, count(DISTINCT journey) as journeyCount, count( DISTINCT poi) as poiCount
        `;
        const params = {
            experienceId
        };
        return await this.neo4jService.read(query, params);
    }

    createManyQuery = (...args: any[]) => {
        const query = `
        MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
        UNWIND $experiences AS newExperience
            MATCH (poi:POI {id: newExperience.poi})
            MERGE (poi)<-[:FOR]-(experience:Experience{id: apoc.create.uuid()}) <- [:EXPERIENCE]- (journey)
            ON CREATE SET   experience.createdAt = datetime(),
                            experience.title = coalesce(newExperience.title,'Untitled Experience'),
                            experience.description = coalesce(newExperience.description, ''),
                            experience.date = coalesce(newExperience.date , datetime()),
                            experience.images = coalesce(newExperience.images , [])
        RETURN experience, poi
        `;
        return {
            query,
            params: {
                userId: args[0],
                journeyId: args[1],
                experiences: args[2]
            }
        };
    };

    updateManyQuery = (...args: any[]) => {
        const query = `
        UNWIND $experiences AS updtExperience
        MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]->(experience:Experience{id: updtExperience.id})
        SET experience.title = coalesce(updtExperience.title, experience.title),
            experience.description = coalesce(updtExperience.description, experience.description),
            experience.date = coalesce(updtExperience.date, experience.date),
            experience.images = coalesce(updtExperience.images, experience.images)
        RETURN experience
    `;
        return {
            query,
            params: {
                userId: args[0],
                journeyId: args[1],
                experiences: args[2]
            }
        };
    };

    deleteManyQuery = (...args: any[]) => {
        const query = `
        UNWIND $experienceIds AS experienceId
        MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id: experienceId})
        DETACH DELETE experience
    `;
        return {
            query,
            params: {
                userId: args[0],
                journeyId: args[1],
                experienceIds: args[2]
            }
        };
    };

    /**
     * Create all experiences given in an array
     * @param userId the ID of the user creating the experiences
     * @param journeyId the ID of the journey the experiences are for
     * @param poiId the ID of the POI the experiences are for
     * @param experiences the experiences to create
     * @returns the created experiences
     */
    async createMany(
        userId: string,
        journeyId: string,
        experiences: CreateExperienceDto[]
    ) {
        const query = this.createManyQuery(userId, journeyId, experiences);
        return await this.neo4jService.write(query.query, query.params);
    }
    /**
     * Updates all experiences given in an array
     * @param userId the ID of the user updating the experiences
     * @param experiences the experiences to update
     * @returns the updated experiences
     */
    async updateMany(userId: string, experiences: UpdateExperienceDto[]) {
        const query = this.updateManyQuery(userId, experiences);
        return await this.neo4jService.write(query.query, query.params);
    }

    /**
     * Delete experiences present in an array
     * @param userId the user who deletes the experiences
     * @param experienceIds the experiences to be deleted
     * @returns
     */
    async deleteMany(userId: string, experienceIds: string[]) {
        const query = this.deleteManyQuery(userId, experienceIds);
        return await this.neo4jService.write(query.query, query.params);
    }

    async batchUpdate(
        userId: string,
        journeyId: string,
        batch: BatchUpdateExperienceDto
    ) {
        const transaction = this.neo4jService
            .getWriteSession()
            .beginTransaction();
        transaction
            .then(async (tx) => {
                const del = this.deleteManyQuery(
                    userId,
                    journeyId,
                    batch.deleted
                );
                await tx.run(del.query, del.params);
                const crt = this.createManyQuery(
                    userId,
                    journeyId,
                    batch.connected
                );
                await tx.run(crt.query, crt.params);
                const updt = this.updateManyQuery(
                    userId,
                    journeyId,
                    batch.updated
                );
                await tx.run(updt.query, updt.params);
                transaction.commit();
            })
            .finally(() => {
                transaction.close();
            });
    }
}
