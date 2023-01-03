import { Integer, ManagedTransaction, QueryResult } from "neo4j-driver";
import { Logger } from "@nestjs/common/services";
import { Injectable } from "@nestjs/common/decorators";
import { Neo4jService } from "../neo4j/neo4j.service";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyNode } from "./entities/journey.entity";
import { ImageNode } from "../image/entities/image.entity";

@Injectable()
export class JourneyRepository {
    logger = new Logger(JourneyRepository.name);
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Get a journey with its creator and the number of experiences
     * @param journey the id of the journey
     * @returns the following records [journey: JourneyNode, creator: string, count: number]
     */
    async findOne(journeyId: string) {
        const query = `
            OPTIONAL MATCH (user:User)-[:CREATED]->(journey:Journey{id: $journeyId,isActive: true})
            OPTIONAL MATCH (journey)-[:EXPERIENCE]->(experience:Experience{isActive: true})
            OPTIONAL MATCH (journey)-[:HAS_IMAGE]->(thumbnail:Image{isActive: true})
            OPTIONAL MATCH (exp)-[:HAS_IMAGE]->(image:Image{isActive: true})
            RETURN  journey, thumbnail, user.username AS creator, count(DISTINCT experience) as expCount, collect(DISTINCT image) as thumbnails`;
        const params = { journeyId };

        const result = await this.neo4jService.read(query, params);
        const journey = new JourneyNode(result.records[0].get("journey"));
        const thumbnail = new ImageNode(result.records[0].get("thumbnail"));
        const creator = result.records[0].get("creator") as string;
        const expCount = result.records[0].get("expCount") as Integer;
        const thumbnails = result.records[0].get("thumbnails") as ImageNode[];

        return {
            journey,
            thumbnail,
            creator,
            expCount,
            thumbnails
        };
    }

    /**
     * create a journey and its experiences
     * @param user the user who creates the journey
     * @param journey the journey to create
     * @returns the created journey with its experiences
     */
    async create(
        user: string,
        createJourney: CreateJourneyDto,
        transaction?: ManagedTransaction
    ) {
        const createJourneyQuery = `
            MATCH(user:User{uid: $user})
                MERGE (journey:Journey{
                    id:apoc.create.uuid(),
                    title: coalesce($journey.title, "Untitled Journey"),
                    description: coalesce($journey.description, ""),
                    start: point({srid:4326,x: $journey.start.longitude, y: $journey.start.latitude}),
                    end: point({srid:4326,x: $journey.end.longitude, y: $journey.end.latitude}),
                    thumbnail: coalesce($journey.thumbnail, ""),
                    visibility: $journey.visibility,
                    isActive: true,
                    createdAt: datetime(),
                    updatedAt: datetime()
                })<-[:CREATED]-(user)
        RETURN journey, user.username AS creator`;
        const params = { user, journey: createJourney };
        let queryResult;
        if (transaction) {
            queryResult = await transaction.run(createJourneyQuery, params);
        } else {
            queryResult = await this.neo4jService.write(
                createJourneyQuery,
                params
            );
        }

        const journey = new JourneyNode(queryResult.records[0].get("journey"));
        const creator = queryResult.records[0].get("creator") as string;

        return { journey, creator };
    }

    /**
     * update a journey
     * @param user the user uid who updates the journey and who created it
     * @param journey  the journey to update with its id
     * @returns  the updated journey with its experiences
     */
    async update(
        user: string,
        journeyUpdate: UpdateJourneyDto,
        transaction?: ManagedTransaction
    ) {
        const query = `
            UNWIND $journeyUpdate as updated
            OPTIONAL MATCH (exp:Experience{isActive: true})<-[expRel:EXPERIENCE]-(journey:Journey{id: updated.id,isActive: true})<-[:CREATED]-(user: User{uid: $user})
            SET journey.title = updated.title,
                journey.description = updated.description,
                journey.visibility = updated.visibility,
                journey.updatedAt = datetime()
            RETURN journey, count(DISTINCT expRel) as expCount, user.username AS creator
    `;

        const params = { user, journeyUpdate };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        const journey = new JourneyNode(result.records[0].get("journey"));
        const creator = result.records[0].get("creator") as string;
        const experienceCount = result.records[0].get("expCount") as Integer;

        return {
            journey,
            creator,
            experienceCount
        };
    }

    /**
     * delete a journey and its experiences
     * @param user the user uid who created the journey
     * @param journey the id of the journey to delete
     * @returns returns the id of the deleted journey
     */
    async delete(
        user: string,
        journey: string,
        transaction?: ManagedTransaction
    ) {
        const delExpRelationQuery = `
            MATCH (r)<-[:EXPERIENCE|HAS_IMAGE*0..2]-(journey: Journey{id: $journey,isActive: true})<-[:CREATED]-(user: User{uid: $user})
            SET journey.isActive = false,
                journey.updatedAt = datetime(),
                r.isActive = false
            RETURN journey.id as journey
        `;
        const params = { user, journey };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(delExpRelationQuery, params);
        } else {
            result = await this.neo4jService.write(delExpRelationQuery, params);
        }

        return {
            journey: result.records[0].get("journey") as string
        };
    }
}
