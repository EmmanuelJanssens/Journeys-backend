import { Injectable } from "@nestjs/common/decorators";
import { Integer } from "neo4j-driver";
import { Neo4jService } from "../neo4j/neo4j.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * get a user by id
     * @param uid id of the user
     * @returns query result with user, journeysCount and pois
     */
    findOne(uid: string) {
        const query = `
            MATCH(user:User{uid:$uid})
                OPTIONAL MATCH(user)-[j:CREATED]->(journey:Journey)
                OPTIONAL MATCH(journey)-[e:EXPERIENCE]->(:POI)
                OPTIONAL MATCH(user)-[p:CREATED]->(:POI)
            RETURN user, count(distinct j) as journeys, count(distinct p) as pois, count(distinct e) as exps
        `;
        const params = { uid };
        return this.neo4jService.read(query, params);
    }

    /**
     * create a user
     * @param user the user data
     * @param uid the id of the user to create
     * @returns query result with user
     */
    create(user: CreateUserDto, uid: string) {
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

    /**
     * update a user
     * @param user  the user data
     * @param uid   the id of the user to update
     * @returns query result with user
     */
    update(uid: string, user: CreateUserDto) {
        const query = `
            UNWIND $user as newUser
            MATCH(user:User{uid:$uid})
            SET user.username = newUser.username,
                user.lastname = newUser.lastname,
                user.firstname = newUser.firstname,
                user.visibility = newUser.visibility
            RETURN user
        `;
        const params = { user, uid };
        return this.neo4jService.write(query, params);
    }

    /**
     * get the journeys of a user
     * @param uid the uid of the user to get the journeys from
     * @param skip skip the first n journeys
     * @param limit limit the result to n journeys
     * @returns query result with user, journeys and expCount
     */
    getJourneys(uid: string, skip: Integer, limit: Integer) {
        const query = `
            OPTIONAL MATCH(user:User{uid:$uid})-[:CREATED]->(journey:Journey)
            OPTIONAL MATCH(journey)-[exps:EXPERIENCE]-(:POI)
            RETURN  user, journey, count( exps) as expCount, collect(exps.images) as thumbnails SKIP $skip*$limit LIMIT $limit
                    `;
        const params = { uid, skip, limit };
        return this.neo4jService.read(query, params);
    }

    /**
     * get the pois of a user
     * @param uid the uid of the user to get the pois from
     * @param skip skip the first n pois
     * @param limit limit the result to n pois
     * @returns query result with pois and expCount
     */
    getPois(uid: string, skip: Integer, limit: Integer) {
        const query = `
            OPTIONAL MATCH(user:User{uid:$uid})-[:CREATED]->(poi:POI)
            OPTIONAL MATCH(poi)<-[exps:EXPERIENCE]-(journey:Journey)
            RETURN poi, count(distinct exps) as expCount SKIP $skip*$limit LIMIT $limit
        `;
        const params = { uid, skip, limit };
        return this.neo4jService.read(query, params);
    }

    /**
     * send an friend invitation to a user
     * @param uid the uid of the sender
     * @param friendUid the uid of the receiver
     */
    sendFriendInvitation(uid: string, friendUid: string) {
        const query = `
            MATCH (user:User{uid:$uid}), (friend:User{uid:$friendUid})
            MERGE (user)-[:INVITED]->(friend)
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }

    /**
     * accept a friend invitation
     * @param uid the uid of the sender
     * @param friendUid the uid of the receiver
     */
    acceptFriendInvitation(uid: string, friendUid: string) {
        const query = `
            MATCH (user:User{uid:$uid})-[inv:INVITED]->(friend:User{uid:$friendUid})
            MERGE (user)-[:FRIEND]->(friend)
            DELETE inv
            WITH user, friend
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }

    /**
     * decline a friend invitation
     * @param uid the uid of the sender
     * @param friendUid the uid of the receiver
     * */
    declineFriendInvitation(uid: string, friendUid: string) {
        const query = `
            MATCH (user:User{uid:$uid})-[inv:INVITED]->(friend:User{uid:$friendUid})
            DELETE inv
            WITH user, friend
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }

    /**
     * remove a friend
     * @param uid the uid of the sender
     * @param friendUid the uid of the receiver
     * */
    removeFriend(uid: string, friendUid: string) {
        const query = `
            MATCH (user:User{uid:$uid})-[f:FRIEND]->(friend:User{uid:$friendUid})
            DELETE f
            WITH user, friend
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }

    /**
     * follow a user
     * @param uid the uid of the follower
     * @param friendUid the uid of the user to follow
     */
    followUser(uid: string, friendUid: string) {
        const query = `
            MATCH (user:User{uid:$uid}), (friend:User{uid:$friendUid})
            MERGE (user)-[:FOLLOW]->(friend)
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }

    /**
     * unfollow a user
     * @param uid the uid of the follower
     * @param friendUid the uid of the user to unfollow
     * */
    unfollowUser(uid: string, friendUid: string) {
        const query = `
            MATCH(user:User{uid:$uid})-[f:FOLLOW]->(friend:User{uid:$friendUid})
            DELETE f
            WITH user, friend
            RETURN user, friend
        `;
        const params = { uid, friendUid };
        return this.neo4jService.write(query, params);
    }
}
