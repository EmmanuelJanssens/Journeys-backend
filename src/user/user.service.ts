import { Injectable } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { PoiDto } from "src/data/dtos";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { User } from "src/neo4j/neo4j.utils";

@Injectable()
export class UserService {
    constructor(private neo4jService: Neo4jService) {}

    private user = User(this.neo4jService.getOGM());

    async getMyJourneys(username: string) {
        const selectionSet = gql`
            {
                journeys {
                    id
                    title
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
            }
        `;
        const condition = { username: username };

        const result = await this.neo4jService.readGql<PoiDto[]>(
            this.user,
            selectionSet,
            condition
        );
        return result[0];
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
                    title
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

        const result = await this.neo4jService.readGql<PoiDto[]>(
            this.user,
            selectionSet,
            condition
        );
        return result;
    }
}
