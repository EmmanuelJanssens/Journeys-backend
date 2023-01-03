import { Injectable } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { Neo4jService } from "../neo4j/neo4j.service";

@Injectable()
export class TagRepository {
    constructor(private readonly neo4jService: Neo4jService) {}
    /**
     * find all tags
     * @returns promise of query result object containing all tags as records
     */
    async findall(): Promise<QueryResult> {
        const query = `
            MATCH (t:Tag)
            RETURN t
        `;
        return this.neo4jService.read(query, {});
    }

    /**
     * find all tags with their respective pois
     * @param tags array of tags
     * @returns promise of query result object containing all tags with their respective pois as records
     */
    async findWithPois(tags: string[]): Promise<QueryResult> {
        const query = `
            MATCH (t:Tag)
            WHERE t.type IN $tags
            OPTIONAL MATCH (t)-[r:TAGGED]->(p:PointOfInterest)
            RETURN t, collect(distinct p) as pois, count(distinct p) as poiCount
        `;
        return this.neo4jService.read(query, { tags: tags });
    }
}
