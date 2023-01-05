import { Injectable, Logger } from "@nestjs/common";
import { Integer, ManagedTransaction, QueryResult } from "neo4j-driver";
import { ImageNode } from "../image/entities/image.entity";
import { TagNode } from "../tag/entities/tag.entity";
import { Neo4jService } from "../neo4j/neo4j.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PoiNode } from "./entities/point-of-interest.entity";

@Injectable()
export class PoiRepository {
    logger = new Logger(PoiRepository.name);

    constructor(private neo4jService: Neo4jService) {}

    /**
     * get a poi by id
     * @param poi  id of the poi
     * @returns  query result with poi, experiences and tags
     */
    get(poi: string): Promise<QueryResult> {
        const query = `
            MATCH (poi:POI{id: $poi})
            OPTIONAL MATCH (poi)<-[:FOR]-(experience:Experience)
            OPTIONAL MATCH (tag:Tag)<-[type:IS_TYPE]-(poi)
            WITH poi,tag, experience LIMIT 5
            RETURN poi, collect(distinct experience) as experiences, collect(distinct tag) as tags
            `;
        const params = { poi };

        return this.neo4jService.read(query, params);
    }

    /**
     * create a poi
     * @param user  id of the user
     * @param poi  data of the poi
     * @returns  query result with poi and tags
     * */
    async create(
        user: string,
        poi: CreatePointOfInterestDto,
        transaction?: ManagedTransaction
    ) {
        const query = `
            MATCH (user:User{uid: $user})
                MERGE (poi: POI{
                    id: apoc.create.uuid(),
                    name: $poi.name,
                    location: point({srid:4326, x: $poi.location.longitude, y: $poi.location.latitude})
                })<-[:CREATED]-(user)
            WITH $poi.tags as tags, poi
            CALL apoc.do.when(
                tags IS NULL OR size(tags) = 0,
                'RETURN NULL',
                'UNWIND
                    $tags as tag
                    MERGE (t:Tag{type: tag})
                    MERGE (poi)-[:IS_TYPE]->(t)
                RETURN collect(t) as tags',
                {tags: tags,poi:poi}) yield value
            RETURN distinct poi, value.tags as tags`;
        const params = { user, poi };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            poi: new PoiNode(result.records[0].get("poi")),
            tags: result.records[0]
                .get("tags")
                .map((tag) => new TagNode(tag)) as TagNode[]
        };
    }

    /**
     * get all pois in a radius around a point
     * @param center  center point
     * @param radius  radius in meters
     * @returns  query result with pois, experiences and tags
     * */
    async getPoisInRadius(
        center: {
            lat: number;
            lng: number;
        },
        radius: number
    ) {
        const query = `
            UNWIND $center as centerPoint
            WITH point({crs:"WGS-84", latitude: centerPoint.lat, longitude: centerPoint.lng}) as center, centerPoint
            MATCH(poi:POI)
            WHERE point.distance(poi.location,center) < $radius
            OPTIONAL MATCH (poi)<-[:FOR]->(exp:Experience)
            OPTIONAL MATCH (tag:Tag)<-[type:IS_TYPE]-(poi)
            RETURN poi,count(distinct exp) as expCount,coalesce(exp.images, []) as images, collect(distinct tag) as tags
        `;
        const params = { center, radius };
        const result = await this.neo4jService.read(query, params);

        return {
            pois: result.records.map((record) => {
                return {
                    poi: new PoiNode(record.get("poi")),
                    expCount: record.get("expCount") as Integer,
                    images: record.get("images"),
                    tags: record
                        .get("tags")
                        .map((tag) => new TagNode(tag)) as TagNode[]
                };
            })
        };
    }

    /**
     * get thumbnail from experience
     * @param poi  id of the poi
     * @returns  query result with thumbnail
     * */
    async getThumbnail(poi: string, transaction?: ManagedTransaction) {
        const query = `
            MATCH (poi:POI{id: $poi})<-[:FOR]-(:Experience)-[:HAS_IMAGE]->(image:Image)
            RETURN image LIMIT 5
        `;
        const params = { poi };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.read(query, params);
        }

        return {
            thumbnails: result.records.map(
                (record) => new ImageNode(record.get("image"))
            )
        };
    }
}
