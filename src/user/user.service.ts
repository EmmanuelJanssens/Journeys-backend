import { BadRequestException, Injectable } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { UpdateUserDto } from "./dto/User.update.dto";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel, UserModel } from "src/neo4j/neo4j.utils";
import { UserInfo } from "@firebase/auth-types";
import { Journey } from "src/model/Journey";
import { PoiService } from "src/poi/poi.service";
import { PartialPOI, PointOfInterest } from "src/model/PointOfInterest";
import { stringify } from "querystring";

@Injectable()
export class UserService {
    constructor(
        private neo4jService: Neo4jService,
        private readonly poiService: PoiService
    ) {}
    private user = UserModel(this.neo4jService.getOGM());
    private journey = JourneyModel(this.neo4jService.getOGM());
    private poi = UserModel(this.neo4jService.getOGM());
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

    async getStats(user_uid: string) {
        const selectionSet = gql`
            {
                journeysConnection {
                    edges {
                        node {
                            experiencesAggregate {
                                count
                            }
                        }
                    }
                }
                poisAggregate {
                    count
                }
                journeysAggregate {
                    count
                }
            }
        `;
        const where = {
            uid: user_uid
        };
        const result = await this.user.find({
            selectionSet,
            where
        });
        let experiences = 0;
        const pois = result[0].poisAggregate.count;
        const journeys = result[0].journeysAggregate.count;
        result[0].journeysConnection.edges.forEach((edge) => {
            experiences += edge.node.experiencesAggregate.count;
        });

        return {
            experiences,
            pois,
            journeys
        };
    }
    async getMyJourneys(user_uid: string, pages: number, cursor: string) {
        const selectionSet = gql`
            {
                username
                journeysAggregate {
                    count
                }
                journeysConnection(first: ${pages}, after: ${
            cursor ? `"${cursor}"` : "null"
        }) {

                    edges {
                        node {
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
                            experiencesAggregate{
                                count
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                }
            }
        `;
        const condition = { uid: user_uid };

        const result: any = await this.neo4jService.readGql(
            this.user,
            selectionSet,
            condition
        );

        const journeys: Journey[] = [];
        let totalExperiences = 0;
        if (result && result.length > 0) {
            result[0].journeysConnection.edges.forEach((edge) => {
                totalExperiences += edge.node.experiencesAggregate.count;
                edge.node.nExperiences = edge.node.experiencesAggregate.count;
                journeys.push(edge.node);
            });
        }
        const paged: {
            total: number;
            totalExperiences: number;
            journeys: Journey[];
            pageInfo: {
                hasNextPage: boolean;
                hasPreviousPage: boolean;
                startCursor: string;
                endCursor: string;
            };
        } = {
            total: result[0].journeysAggregate.count,
            totalExperiences,
            journeys,
            pageInfo: result[0].journeysConnection.pageInfo
        };
        return paged;
    }

    async getMyCreatedPois(userUid: string) {
        const selectionSet = gql`
            {
                journeysConnection {
                    totalCount
                }
                poisConnection {
                    totalCount
                    edges {
                        node {
                            id
                            name
                            location {
                                latitude
                                longitude
                            }
                            experiencesAggregate {
                                count
                            }
                        }
                    }
                }
            }
        `;
        const where = {
            uid: userUid
        };
        const result = await this.user.find({ selectionSet, where });
        const pois: PartialPOI[] = [];
        for (const edge of result[0].poisConnection.edges) {
            const url = await this.poiService.getRandomThumbnail({
                id: edge.node.id
            });
            pois.push({
                id: edge.node.id,
                name: edge.node.name,
                location: edge.node.location,
                nExperiences: edge.node.experiencesAggregate.count,
                thumbnail: url.url
            });
        }

        return pois;
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
