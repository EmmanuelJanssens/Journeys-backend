import { Injectable } from "@nestjs/common/decorators";
import { Neo4jService } from "neo4j/neo4j.service";

@Injectable()
export class UserRepository {
    constructor(private readonly neo4jService: Neo4jService) {}
}
