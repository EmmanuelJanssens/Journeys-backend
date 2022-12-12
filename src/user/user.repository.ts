import { Injectable } from "@nestjs/common/decorators";
import { Integer } from "neo4j-driver";
import { Neo4jService } from "neo4j/neo4j.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user-dto";

@Injectable()
export class UserRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    findOne(uid: string) {
        const query = `
            MATCH(user:User{uid:$uid})
                OPTIONAL MATCH(user)-[j:CREATED]->(:Journey)
                OPTIONAL MATCH(user)-[p:CREATED]->(:POI)
            RETURN user, count(distinct j) as journeys, count(distinct p) as pois
        `;
        const params = { uid };
        return this.neo4jService.read(query, params);
    }

    create(user: CreateUserDto, uid) {
        const query = `
            UNWIND $user as newUser
            CREATE(user:User{
                uid: $uid,
                username: newUser.username,
                lastname: newUser.lastname,
                firstname: newUser.firstname,
                visibility: newUser.visibility
            })
            RETURN user
        `;
        const params = { user, uid };
        return this.neo4jService.write(query, params);
    }

    getJourneys(uid: string, skip: Integer, limit: Integer) {
        const query = `
            OPTIONAL MATCH(user:User{uid:$uid})-[:CREATED]->(journey:Journey)
            OPTIONAL MATCH(journey)-[exps:EXPERIENCE]-(:POI)
            RETURN  user, journey, count( exps) as expCount SKIP $skip*$limit LIMIT $limit
                    `;
        const params = { uid, skip, limit };
        return this.neo4jService.read(query, params);
    }

    getPois(uid: string, skip: Integer, limit: Integer) {
        const query = `
            OPTIONAL MATCH(user:User{uid:$uid})-[:CREATED]->(poi:POI)
            OPTIONAL MATCH(poi)<-[exps:EXPERIENCE]-(journey:Journey)
            RETURN poi, count(distinct exps) as expCount SKIP $skip*$limit LIMIT $limit
        `;
        const params = { uid, skip, limit };
        return this.neo4jService.read(query, params);
    }
}
