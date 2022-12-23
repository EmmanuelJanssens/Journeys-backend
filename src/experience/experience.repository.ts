import { Injectable } from "@nestjs/common";
import { ManagedTransaction } from "neo4j-driver";
import { Transaction } from "nest-neo4j/dist";
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
            WHERE journey.isActive = true AND poi.isActive = true
            MERGE (experience:Experience{
                id: apoc.create.uuid()
            })
            ON CREATE SET   experience.createdAt = datetime(),
                            experience.title = coalesce($experience.title,'Untitled'),
                            experience.description = coalesce($experience.description, ''),
                            experience.date = coalesce($experience.date , datetime())
                            experience.isActive = true
                            experience.createdAt = datetime()
                            experience.updatedAt = datetime()
            MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
            WITH experience, user, journey, poi
            CALL apoc.do.when(
                size($experience.images) > 0,
                '
                    UNWIND experienceImages as image
                    MERGE (imageNode:Image {id: apoc.create.uuid()})
                    ON CREATE
                        SET imageNode.original = image,
                            imageNode.thumbnail = image + "_thumb"
                            imageNode.isActive = true
                            imageNode.createdAt = datetime()
                            imageNode.updatedAt = datetime()
                    MERGE (experience)-[:HAS_IMAGE]->(imageNode)
                    RETURN collect(imageNode) as images
                ',
                'RETURN []',
                {experienceImages: $experience.images, experience: experience}
            ) YIELD value
            RETURN experience, user, journey, poi, value.images as images

        `;

        const params = {
            userId,
            journeyId,
            experience
        };
        return await this.neo4jService.write(query, params);
    }

    async create2(
        tx: ManagedTransaction | Transaction,
        userId: string,
        experience: CreateExperienceDto,
        journeyId: string
    ) {
        const query = `
            MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
            MATCH (poi:POI {id: $experience.poi})
            WHERE journey.isActive = true AND poi.isActive = true
            CREATE (experience:Experience{
                id: apoc.create.uuid(),
                title: coalesce($experience.title,'Untitled'),
                description: coalesce($experience.description, ''),
                date: coalesce($experience.date , datetime()),
                isActive: true,
                createdAt: datetime(),
                updatedAt: datetime()})
            MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
            RETURN experience
        `;
        const params = {
            userId,
            journeyId,
            experience
        };
        return tx.run(query, params);
    }

    /**
     * Update an experience
     * @param experience The experience to update
     * @param userId the ID of the user updating the experience
     * @return the updated experience
     */
    async update(
        tx: ManagedTransaction | Transaction,
        userId: string,
        experienceId: string,
        experience: UpdateExperienceDto
    ) {
        const query = `
        MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id : $experienceId})
        WHERE experience.isActive = true
        SET experience.title = coalesce($experience.title, experience.title),
            experience.description = coalesce($experience.description, experience.description),
            experience.date = coalesce($experience.date, experience.date),
            experience.updatedAt = datetime()
        RETURN experience
        `;
        const param = {
            userId,
            experienceId,
            experience
        };
        return tx.run(query, param);
    }

    async delete2(
        tx: ManagedTransaction | Transaction,
        userId: string,
        experienceId: string
    ) {
        const query = `
        MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id : $experienceId})
        WHERE experience.isActive = true
        SET experience.isActive = false,
            experience.updatedAt = datetime()
        RETURN experience
        `;
        const param = {
            userId,
            experienceId
        };
        return tx.run(query, param);
    }

    /**
     * delete an experience
     * @param userId the user who deletes the experience
     * @param experienceId the experience to be deleted
     */
    async delete(userId: string, experienceId: string) {
        const query = `
            MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id: $experienceId})
            WHERE experience.isActive = true
            SET experience.isActive = false
            RETURN experience.id as experience
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
            OPTIONAL MATCH  (img:Image)<-[:HAS_IMAGE]-(experience:Experience {id: $experienceId}),
                            (poi:POI)<-[:FOR]-(experience),
                            (journey:Journey)-[:EXPERIENCE]->(experience)
            WHERE experience.isActive = true
            RETURN experience, collect(img) as Images, poi, journey
        `;
        const params = {
            experienceId
        };
        return await this.neo4jService.read(query, params);
    }

    createManyQuery = (...args: any[]) => {
        const query = `
        MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
            UNWIND $experiences as exp_to_add
            MATCH (poi:POI {id: exp_to_add.poi})
            MERGE (poi)<-[:FOR]-(created_exp:Experience{id: apoc.create.uuid()}) <- [:EXPERIENCE]- (journey)
            ON CREATE SET   created_exp.createdAt = datetime(),
                            created_exp.title = coalesce(exp_to_add.title,'Untitled Experience'),
                            created_exp.description = coalesce(exp_to_add.description, ''),
                            created_exp.date = coalesce(exp_to_add.date , datetime())
                            WITH created_exp, poi, journey, exp_to_add
                            CALL apoc.do.when(
                                size(exp_to_add.images) > 0,
                                '
                                    UNWIND experienceImages as image
                                    MERGE (imageNode:Image {id: apoc.create.uuid()})
                                    ON CREATE SET imageNode.original = image, imageNode.thumbnail = image + "_thumb"
                                    MERGE (experience)-[:HAS_IMAGE]->(imageNode)
                                    RETURN collect(imageNode) as images
                                ',
                                'RETURN []',
                                {experienceImages: exp_to_add.images, experience: created_exp}
                            ) YIELD value

        RETURN created_exp as experience, poi
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
        UNWIND $experiences AS exp_to_update
        MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]->(updated_exp:Experience{id: exp_to_update.id})
        SET updated_exp.title = coalesce(exp_to_update.title, updated_exp.title),
            updated_exp.description = coalesce(exp_to_update.description, updated_exp.description),
            updated_exp.date = coalesce(exp_to_update.date, updated_exp.date)
            CALL apoc.do.when( size($experience.addedImages) > 0,
            '
                UNWIND experienceImages as addedImage
                MERGE (imageNode:Image{
                    id: apoc.create.uuid(),
                    original: addedImage,
                    thumbnail: addedImage+"_thumb"
                })
                MERGE (imageNode)<-[:HAS_IMAGE]-(experience)
                RETURN imageNode
            '
            ,"",
            {experienceImages: $experience.addedImages, experience: experience})
            YIELD value AS added
            CALL apoc.do.when( size($experience.removedImages) > 0,
                '
                    UNWIND experienceImages as removedImage
                    OPTIONAL MATCH (imageNode:Image{id: removedImage})
                    WHERE imageNode IS NOT NULL DETACH DELETE imageNode
                    RETURN removedImage
                '
                ,"",
                {experienceImages: $experience.removedImages, experience: updated_exp})
            YIELD value AS removed
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
