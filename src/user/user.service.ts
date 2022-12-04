import { BadRequestException, Injectable } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { UpdateUserDto } from "./dto/User.update.dto";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel, UserModel } from "src/neo4j/neo4j.utils";
import { UserInfo } from "@firebase/auth-types";

@Injectable()
export class UserService {
    constructor(private neo4jService: Neo4jService) {}
    private user = UserModel(this.neo4jService.getOGM());
    private journey = JourneyModel(this.neo4jService.getOGM());
    async checkUsername(username: string) {
        const result = await this.user.find({
            where: {
                username: username
            }
        });
        if (result.length > 0) {
            throw new BadRequestException("user already exists");
        }
        return true;
    }
    async updateProfile(newUser: UpdateUserDto, uid: string) {
        const input = {
            update: newUser,
            where: {
                uid: uid
            }
        };

        const result = await this.user.update(input);
        if (result.users.length == 1) return result.users[0];
        else throw new BadRequestException("Could not create user");
    }
    async getMyProfile(username: UserInfo) {
        const selectionSet = gql`
            {
                journeysAggregate {
                    count
                }
                journeysConnection {
                    edges {
                        node {
                            experiencesAggregate {
                                count
                            }
                        }
                    }
                }
            }
        `;

        const condition = { uid: username.uid };
        const result = await this.neo4jService.readGql<UpdateUserDto[]>(
            this.user,
            selectionSet,
            condition
        );

        return result[0];
    }

    async getData(username: UserInfo) {
        const selectionSet = gql`
            {
                username
                firstName
                lastName
                banner
                citation
                visibility
                completed
            }
        `;

        const condition = { uid: username.uid };
        const result = await this.neo4jService.readGql<UpdateUserDto[]>(
            this.user,
            selectionSet,
            condition
        );

        return result[0];
    }
    async getMyJourneys(user_uid: string) {
        const selectionSet = gql`
            {
                id
                title
                description
                thumbnail
                start {
                    latitude
                    longitude
                }
                end {
                    latitude
                    longitude
                }
            }
        `;

        const condition = { creator: { uid: user_uid } };

        const result = await this.neo4jService.readGql(
            this.journey,
            selectionSet,
            condition
        );

        return result;
    }

    async getMyExperiences(username: string) {
        const selectionSet = gql`
            {
                journeys {
                    experiencesConnection {
                        edges {
                            description
                            images
                            order
                            date
                            node {
                                id
                                name
                                location {
                                    longitude
                                    latitude
                                }
                            }
                        }
                    }
                    id
                    title
                    description
                }
                experiencesConnection {
                    edges {
                        description
                        images
                        date
                        node {
                            id
                            name
                            location {
                                longitude
                                latitude
                            }
                        }
                    }
                }
            }
        `;

        const condition = { username: username };

        const result = await this.neo4jService.readGql(
            this.user,
            selectionSet,
            condition
        );

        //transform to readable
        return result[0];
    }
}
