import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common";
import { gql } from "apollo-server-express";
import { Journey } from "src/model/Journey";
import { JourneyExperiences } from "src/model/JourneyExperiences";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel } from "src/neo4j/neo4j.utils";
import * as uuid from "uuid";
import { CreateJourneyDto } from "./dto/CreateJourneyDto";
import { UpdateJourneyExperiencesDto } from "./dto/UpdateJourneyExperiencesDto";
import { UpdateJourneyDto } from "./dto/UpdateJourneyDto";
import { Experience } from "src/model/Experience";
import { PointOfInterest } from "src/model/PointOfInterest";
import { Point } from "neo4j-driver";
@Injectable()
export class JourneyService {
    constructor(private readonly neo4jService: Neo4jService) {}

    private journey = JourneyModel(this.neo4jService.getOGM());

    private logger = new Logger(JourneyService.name);
    async getJourneys(page, pageSize) {
        // limit by then by default
        const options = {
            limit: pageSize,
            offset: page
        };

        const selectionSet = gql`
            {
                id
                title
                description
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
                    uid
                    username
                }
            }
        `;

        const count = await this.journey.aggregate({
            aggregate: {
                count: 1
            }
        });
        const journeys: Journey[] = await this.journey.find({
            selectionSet,
            options
        });

        if (journeys.length <= 0) {
            throw new BadRequestException();
        }
        const result = {
            data: journeys,
            pageInfo: {
                totalCount: count.count,
                pageCount: Math.ceil(count.count / pageSize),
                currentPage: page,
                hasNextPage: (page + 1) * pageSize < count.count,
                first: page === 0
            }
        };
        return result;
    }
    async getJourneyExperiences(
        id,
        cursor,
        experiences
    ): Promise<JourneyExperiences> {
        const nexp = Number(experiences) ? Number(experiences) : 10;
        const selectionSet = gql`
            {
                id
                title
                description
                thumbnail
                creator {
                    uid
                    username
                }
                start {
                    latitude
                    longitude
                }
                end {
                    latitude
                    longitude
                }
                experiencesAggregate {
                    count
                }
                experiencesConnection {
                    edges {
                        title
                        date
                        description
                        images
                        order
                        node {
                            id
                            name
                            location {
                                latitude
                                longitude
                            }
                        }
                    }
                    pageInfo {
                        startCursor
                        endCursor
                        hasNextPage
                        hasPreviousPage
                    }
                }
                experiencesAggregate {
                    count
                }
            }
        `;

        const condition = { id };
        const response: any[] = await this.neo4jService.readGql(
            this.journey,
            selectionSet,
            condition
        );
        if (response.length > 1) {
            throw new BadRequestException(
                "An error occured while fetching journeys"
            );
        } else if (response.length === 0) {
            throw new NotFoundException("Journey not found");
        } else {
            const result = new JourneyExperiences();
            result.nbExperiences = response[0].experiencesAggregate.count;
            result.start = response[0].start;
            result.end = response[0].end;
            result.thumbnail = response[0].thumbnail;
            result.title = response[0].title;
            result.id = response[0].id;
            result.experiences = [];
            response[0].experiencesConnection.edges.forEach((edge) => {
                const node = edge.node;
                delete edge.node;
                result.experiences.push({
                    data: edge,
                    poi: node
                });
            });

            result.experiences.sort(
                (a, b) =>
                    new Date(a.data.date).getTime() -
                    new Date(b.data.date).getTime()
            );
            return result;
        }
    }

    async addJourney(
        journey: CreateJourneyDto,
        user_uid: string
    ): Promise<Journey> {
        const connections = [];
        journey.experiences.forEach((experience) => {
            connections.push({
                where: {
                    node: {
                        id: experience.poi.id
                    }
                },
                edge: experience.data
            });
        });
        const input = {
            input: [
                {
                    id: journey.id,
                    title: journey.title,
                    description: journey.description,
                    visibility: journey.visibility,
                    start: journey.start,
                    end: journey.end,
                    experiences: {
                        connect: connections
                    },
                    creator: {
                        connect: {
                            where: {
                                node: {
                                    uid: user_uid
                                }
                            }
                        }
                    }
                }
            ]
        };
        const created = await this.journey.create(input);
        return created.journeys[0];
    }
    async updateJourneyExperiences(
        data: UpdateJourneyExperiencesDto,
        userId: string,
        journeyId: string
    ) {
        const experiences = [];
        const connected = [];
        const updated = [];

        if (data.connected?.length > 0) {
            data.connected?.forEach((poiConnected) => {
                connected.push({
                    where: {
                        node: {
                            id: poiConnected.poi.id
                        }
                    },
                    edge: poiConnected.data
                });
            });
        }

        experiences.push({
            connect: connected,
            disconnect: [
                {
                    where: {
                        node: {
                            id_IN: data.deleted
                        }
                    }
                }
            ],
            update: updated
        });

        if (data.updated?.length > 0) {
            data.updated.forEach((poiUpdated) => {
                experiences.push({
                    update: {
                        edge: poiUpdated.data
                    },
                    where: {
                        node: {
                            id: poiUpdated.poi.id
                        }
                    }
                });
            });
        }

        const input = {
            update: {
                experiences: experiences,
                title: data.journey.title,
                description: data.journey.description,
                thumbnail: data.journey.thumbnail
            },
            where: {
                id: journeyId,
                creator: {
                    uid: userId
                }
            }
        };

        const resultUpdated = await this.journey.update(input);
        return resultUpdated.journeys[0];
    }

    async updateJourney(
        journey: UpdateJourneyDto,
        user_uid: string
    ): Promise<UpdateJourneyDto> {
        const selectionSet = gql`
            {
                journeys {
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
            }
        `;

        const input = {
            selectionSet: selectionSet,
            update: {
                title: journey.title,
                description: journey.description,
                thumbnail: journey.thumbnail
            },
            where: {
                id: journey.id,
                creator: {
                    uid: user_uid
                }
            }
        };
        const resultUpdated = await this.journey.update(input);
        return resultUpdated;
    }

    async updateExperience(
        data: Experience,
        poi: string,
        journey_id: string,
        user_uid: string
    ) {
        const updated = await this.journey.update({
            where: {
                id: journey_id,
                creator: { uid: user_uid }
            },
            update: {
                experiences: [
                    {
                        update: {
                            edge: data
                        },
                        where: {
                            node: {
                                id: poi
                            }
                        }
                    }
                ]
            }
        });

        if (updated.length == 0) {
            throw new BadRequestException();
        }
        return updated.journeys[0];
    }

    async removeExperience(id: string, poi: string, user_uid: string) {
        const selectionSet = gql`
            {
                journeys {
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
            }
        `;
        const updated = await this.journey.update({
            selectionSet: selectionSet,
            where: {
                id: id,
                creator: { uid: user_uid }
            },
            disconnect: {
                experiences: {
                    where: {
                        node: {
                            id: poi
                        }
                    }
                }
            }
        });
        if (updated.length == 0) {
            throw new BadRequestException();
        }
        return updated.journeys[0];
    }
    async addExperience(
        body: {
            data: Experience;
            poi: PointOfInterest;
        },
        user_uid: string,
        journey_id: string
    ) {
        const added = await this.journey.update({
            where: {
                id: journey_id,
                creator: { uid: user_uid }
            },
            update: {
                experiences: [
                    {
                        where: {
                            node: {
                                id: body.poi.id
                            }
                        },
                        edge: body.data
                    }
                ]
            }
        });

        if (added.length == 0) {
            throw new BadRequestException();
        }
        return added;
    }

    async setImage(journey: string, poi: string, img: string, user: string) {
        const input = {
            update: {
                experiences: {
                    update: {
                        edge: {
                            images_PUSH: img
                        }
                    },
                    where: {
                        node: {
                            id: poi
                        }
                    }
                }
            },
            where: {
                id: journey,
                creator: {
                    uid: user
                }
            }
        };

        const result = await this.journey.update(input);
        return result.journeys[0];
    }
    async deleteJourney(id: string) {
        if (id === undefined || id === "")
            throw new BadRequestException("Journey not found");
        const deleted = await this.journey.delete({
            where: { id: id }
        });

        return deleted;
    }
}
