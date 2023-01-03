import { Injectable } from "@nestjs/common";
import { ManagedTransaction, QueryResult } from "neo4j-driver";
import { JourneyNode } from "../journey/entities/journey.entity";
import { PoiNode } from "../point-of-interest/entities/point-of-interest.entity";
import { Neo4jService } from "../neo4j/neo4j.service";
import { CreateExperienceDto } from "./dto/create-experience.dto";
import { UpdateExperienceDto } from "./dto/update-experience.dto";
import { ExperienceNode } from "./entities/experience.entity";

@Injectable()
export class ExperienceRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    async create(
        userId: string,
        experience: CreateExperienceDto,
        journeyId: string,
        transaction?: ManagedTransaction
    ) {
        const query = `
            MATCH (user:User {uid: $userId})-[:CREATED]->(journey:Journey{id: $journeyId})
            MATCH (poi:POI {id: $experience.poi.id})
            WHERE journey.isActive = true AND poi.isActive = true
            CREATE (experience:Experience{
                id: apoc.create.uuid(),
                title: coalesce($experience.title,'Untitled'),
                description: coalesce($experience.description, ''),
                date: coalesce($experience.date , datetime()),
                isActive: true,
                addedImages: $experience.addedImages,
                createdAt: datetime(),
                updatedAt: datetime()})
            MERGE (journey)-[:EXPERIENCE]->(experience)-[:FOR]->(poi)
            RETURN experience, poi
        `;
        const params = {
            userId,
            journeyId,
            experience
        };
        let result;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            experience: new ExperienceNode(result.records[0].get("experience")),
            poi: new PoiNode(result.records[0].get("poi"))
        };
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
        experience: UpdateExperienceDto,
        transaction?: ManagedTransaction
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

        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, param);
        } else {
            result = await this.neo4jService.write(query, param);
        }

        return {
            experience: new ExperienceNode(result.records[0].get("experience"))
        };
    }

    async delete(
        userId: string,
        experienceId: string,
        transaction?: ManagedTransaction
    ) {
        const query = `
        OPTIONAL MATCH(user:User {uid: $userId})-[:CREATED | EXPERIENCE*0..2]-(experience:Experience{id : $experienceId})-[:HAS_IMAGE*0..1]->(end)
        WHERE experience.isActive = true
        SET experience.isActive = false,
            end.isActive = false
        RETURN DISTINCT experience
        `;
        const param = {
            userId,
            experienceId
        };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, param);
        } else {
            result = await this.neo4jService.write(query, param);
        }

        return {
            experience: new ExperienceNode(result.records[0].get("experience"))
        };
    }

    /**
     * Get an experience
     * @param experienceId the ID of the experience to get
     * @returns the experience
     * */
    async findOne(experienceId: string, transaction?: ManagedTransaction) {
        const query = `
            OPTIONAL MATCH  (img:Image)<-[:HAS_IMAGE]-(experience:Experience {id: $experienceId}),
                            (poi:POI)<-[:FOR]-(experience),
                            (journey:Journey)-[:EXPERIENCE]->(experience)
            WHERE experience.isActive = true
            RETURN experience, collect(img) as images, poi, journey
        `;
        const params = {
            experienceId
        };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.read(query, params);
        }

        return {
            experience: new ExperienceNode(result.records[0].get("experience")),
            images: result.records[0].get("images"),
            poi: new PoiNode(result.records[0].get("poi")),
            journey: new JourneyNode(result.records[0].get("journey"))
        };
    }

    /**
     * get experiences related to a journey
     * @param journeyId the ID of the journey
     * @returns
     */
    async findManyByJourneyId(
        journeyId: string,
        transaction?: ManagedTransaction
    ) {
        const query = `
            OPTIONAL MATCH(journey:Journey{id: $journeyId})-[:EXPERIENCE]->(experience:Experience{isActive:true})-[:FOR]->(poi:POI)
            OPTIONAL MATCH (img:Image{isActive:true})<-[:HAS_IMAGE]-(experience)
            WHERE experience.isActive = true
            RETURN experience, collect(img) as images, poi
        `;
        const params = {
            journeyId
        };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.read(query, params);
        }

        return {
            experiences: result.records.map((record) => {
                return {
                    experience: new ExperienceNode(record.get("experience")),
                    images: record.get("images"),
                    poi: new PoiNode(record.get("poi"))
                };
            })
        };
    }
}
