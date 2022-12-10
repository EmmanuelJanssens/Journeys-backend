import { Logger } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { Neo4jService } from "neo4j/neo4j.service";
import { IRepository } from "repository/IRepository";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PointOfInterestDto } from "./dto/point-of-interest.dto";
import { PointOfInterest } from "./entities/point-of-interest.entity";
import * as uuid from "uuid";
export class PoiRepository extends IRepository<PointOfInterestDto> {
    logger = new Logger(PoiRepository.name);

    constructor(private neo4jService: Neo4jService) {
        super();
    }
    get(poi: string): Promise<PointOfInterest> {
        const query = `MATCH (poi:POI{id: $poi}) RETURN poi`;
        const param = { poi };
        return this.neo4jService
            .read(query, param)
            .then((result: QueryResult) => {
                if (result.records.length > 1) throw Error("Too many pois");
                const poi = result.records[0].get("poi");
                return poi;
            })
            .catch((e) => {
                this.logger.debug(e.message);
                throw Error("could not read poi");
            });
    }

    create(
        user: string,
        id: CreatePointOfInterestDto
    ): Promise<PointOfInterest> {
        throw new Error("Method not implemented.");
    }
    update(user: string, item: PointOfInterest): Promise<PointOfInterest> {
        throw new Error("Method not implemented.");
    }
    delete(user: string, id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
