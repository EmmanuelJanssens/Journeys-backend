import { BadRequestException, Injectable } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { PoiDto, UpdateUserDto, UserDto } from "src/data/dtos";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel, UserModel } from "src/neo4j/neo4j.utils";

@Injectable()
export class UserService {
    constructor(private neo4jService: Neo4jService) {}
    private user = UserModel(this.neo4jService.getOGM());
    private journey = JourneyModel(this.neo4jService.getOGM());
    async checkUsername(newUser: UpdateUserDto) {
        const result = await this.user.find({
            where: {
                username: newUser.user.username
            }
        });
        if (result.length > 0) {
            throw new BadRequestException("user already exists");
        }
        return true;
    }
    async updateProfile(newUser: UpdateUserDto) {
        const input = {
            update: {
                username: newUser.user.username,
                lastName: newUser.user.lastName,
                firstName: newUser.user.firstName,
                email: newUser.user.email,
                banner: newUser.user.banner,
                citation: newUser.user.citation,
                public: newUser.user.public
            },
            where: {
                username: newUser.oldUsername
            }
        };

        const result = await this.user.update(input);
        if (result.users.length == 1) return result.users[0];
        else throw new BadRequestException("Could not create user");
    }
    async getMyProfile(username: string) {
        const selectionSet = gql`
            {
                username
                firstName
                lastName
                email
                public
                banner
                citation
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

        const condition = { username: username };
        const result = await this.neo4jService.readGql<UserDto[]>(
            this.user,
            selectionSet,
            condition
        );

        return result[0];
    }
    async getMyJourneys(username: string) {
        const selectionSet = gql`
            {
                id
                title
                description
                thumbnail
                start {
                    address
                    latitude
                    longitude
                }
                end {
                    address
                    latitude
                    longitude
                }
                creator {
                    username
                }
            }
        `;

        const condition = { creator: { username: username } };

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
