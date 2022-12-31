import { QueryResult } from "neo4j-driver";
import { Logger } from "@nestjs/common/services";
import { Injectable } from "@nestjs/common/decorators";
import { Neo4jService } from "../neo4j/neo4j.service";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
@Injectable()
export class JourneyRepository {
    logger = new Logger(JourneyRepository.name);
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Get a journey with its creator and the number of experiences
     * @param journey the id of the journey
     * @returns the following records [journey: JourneyNode, creator: string, count: number]
     */
    get(journey: string): Promise<QueryResult> {
        const query = `
            OPTIONAL MATCH (user:User)-[:CREATED]->(journey:Journey{id: $journey})-[expRel:EXPERIENCE]->(exp    :Experience)
            WHERE journey.isActive = true
            RETURN journey, user.username AS creator, count(DISTINCT expRel) as count, collect(DISTINCT exp.images) as thumbnails`;
        const params = { journey };

        return this.neo4jService.read(query, params);
    }

    /**
     * create a journey and its experiences
     * @param user the user who creates the journey
     * @param journey the journey to create
     * @returns the created journey with its experiences
     */
    async create(
        user: string,
        journey: CreateJourneyDto
    ): Promise<QueryResult> {
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
        const params = { user, journey };
        return this.neo4jService.write(createJourneyQuery, params);
    }

    /**
     * update a journey
     * @param user the user uid who updates the journey and who created it
     * @param journey  the journey to update with its id
     * @returns  the updated journey with its experiences
     */
    update(user: string, journey: UpdateJourneyDto): Promise<QueryResult> {
        const query = `
            UNWIND $journey as updated
            OPTIONAL MATCH (exp:Experience)<-[expRel:EXPERIENCE]-(journey:Journey{id: updated.id})<-[:CREATED]-(user: User{uid: $user})
                SET journey.title = updated.title,
                 journey.description = updated.description,
                 journey.thumbnail = updated.thumbnail,
                 journey.visibility = updated.visibility
                 journey.updatedAt = datetime()
            RETURN journey,  collect(DISTINCT exp.images) as thumbnails, count(DISTINCT expRel) as count, user.username AS creator
    `;

        return this.neo4jService.write(query, {
            journey,
            user
        });
    }

    /**
     * delete a journey and its experiences
     * @param user the user uid who created the journey
     * @param journey the id of the journey to delete
     * @returns returns the id of the deleted journey
     */
    async delete(user: string, journey: string): Promise<QueryResult> {
        const delExpRelationQuery = `
            MATCH (journey: Journey{id: $journey})<-[:CREATED]-(user: User{uid: $user})
            SET journey.isActive = false,
                journey.updatedAt = datetime()
            RETURN journey.id as journey
        `;
        const params = { user, journey };
        return this.neo4jService.write(delExpRelationQuery, params);
    }

    /**
     * Get experiences belonging to a journey
     * @param journey_id the ID of the journey
     */
    async getExperiences(journeyId: string) {
        const query = `
                MATCH (user: User)-[:CREATED]->(journey:Journey {id: $journeyId})-[:EXPERIENCE]->(experience:Experience)-[:FOR]->(poi:POI)
                WHERE journey.isActive = true
                RETURN journey,experience, poi, user.username as creator
            `;
        const params = {
            journeyId
        };
        return await this.neo4jService.read(query, params);
    }

    /**
     * push an image to an experience
     * @param user user uid who created the journey
     * @param journey journey id to which the experience belongs
     * @param poi poi id to which the experience belongs
     * @param image image url to push
     * @returns the updated experience
     */
    async pushImage(
        user: string,
        journey: string,
        poi: string,
        image: string
    ): Promise<QueryResult> {
        const query = `
            MATCH (user:User{uid:$user})-[:CREATED]->(journey:Journey{id:$journey})-[experience:EXPERIENCE]->(poi: POI{id:$poi})
            SET experience.images = coalesce(experience.images, []) + $image
            RETURN experience
        `;
        const params = { user, journey, poi, image };
        return this.neo4jService.write(query, params);
    }
}
