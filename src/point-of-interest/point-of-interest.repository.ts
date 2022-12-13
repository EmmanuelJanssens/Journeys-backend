import { Injectable, Logger } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { Neo4jService } from "neo4j/neo4j.service";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PointOfInterest } from "./entities/point-of-interest.entity";

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
            OPTIONAL MATCH (poi)<-[experience]-()
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
    create(user: string, poi: CreatePointOfInterestDto): Promise<QueryResult> {
        const query = `
            MATCH (user:User{uid: $user})
            UNWIND $poi as newPoi
                MERGE (poi: POI{
                    id: apoc.create.uuid(),
                    name: newPoi.name,
                    location: point({srid:4326, x: newPoi.location.latitude, y: newPoi.location.longitude})
                })<-[:CREATED]-(user)
            WITH newPoi.tags as tags, poi
            UNWIND tags as connectTag
            MERGE (tag:Tag{type: connectTag})
            MERGE (tag)<-[:IS_TYPE]-(poi)
            RETURN distinct poi, collect(tag) as tags`;
        const params = { user, poi };
        return this.neo4jService.write(query, params);
    }

    /**
     * get all pois in a radius around a point
     * @param center  center point
     * @param radius  radius in meters
     * @returns  query result with pois, experiences and tags
     * */
    getPoisInRadius(
        center: {
            lat: number;
            lng: number;
        },
        radius: number
    ): Promise<QueryResult> {
        const query = `
            UNWIND $center as centerPoint
            WITH point({crs:"WGS-84", latitude: centerPoint.lat, longitude: centerPoint.lng}) as center, centerPoint
            MATCH(poi:POI)
            WHERE point.distance(poi.location,center) < $radius
            OPTIONAL MATCH (:Journey)-[exp:EXPERIENCE]->(poi)
            OPTIONAL MATCH (tag:Tag)<-[type:IS_TYPE]-(poi)
            RETURN poi,count(distinct exp) as expCount, collect(distinct tag) as tags
        `;
        const params = { center, radius };
        return this.neo4jService.read(query, params);
    }
}
