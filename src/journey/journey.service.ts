import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common";
import { gql } from "apollo-server-express";
import {
    DeleteExperience,
    ExperienceDto,
    JourneyDto,
    UpdateJourneyDto
} from "src/data/dtos";
import { Journey } from "src/model/Journey";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel } from "src/neo4j/neo4j.utils";
import * as uuid from "uuid";
import { CreateJourneyDto } from "./dto/CreateJourneyDto";
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
        const journeys: JourneyDto[] = await this.journey.find({
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

    async getJourney(id, cursor, experiences) {
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
                start{
                    address
                    latitude
                    longitude
                }
                end{
                    address
                    latitude
                    longitude
                }
                experiencesAggregate{
                  count
                }
                experiencesConnection(first:${nexp}, after:  ${cursor} ) {
                  edges {
                    title
                    date
                    description
                    images
                    order
                    node {
                      id
                      name
                      location{
                        latitude
                        longitude
                      }
                    }
                  }
                  pageInfo{
                    startCursor
                    endCursor
                    hasNextPage
                    hasPreviousPage
                  }
                }
                experiencesAggregate{
                    count
                }

            }
            `;

        const condition = { id };
        const j: any[] = await this.neo4jService.readGql(
            this.journey,
            selectionSet,
            condition
        );
        if (j.length > 1) {
            throw new BadRequestException(
                "An error occured while fetching journeys"
            );
        } else if (j.length === 0) {
            throw new NotFoundException("Journey not found");
        } else {
            const result = j[0] as JourneyDto;

            result.experiencesConnection.edges.sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            return result;
        }
    }

    async addJourney(
        journeyData: CreateJourneyDto,
        user_uid: string
    ): Promise<Journey> {
        const connections = [];
        journeyData.experiences?.forEach((experience) => {
            connections.push({
                where: {
                    node: {
                        id: experience.poi.uid
                    }
                },
                edge: experience.data
            });
        });
        const input = {
            input: [
                {
                    id: uuid.v4(),
                    title: journeyData.title,
                    description: journeyData.description,
                    visibility: journeyData.visibility,
                    start: {
                        longitude: journeyData.start.longitude,
                        latitude: journeyData.start.latitude
                    },
                    end: {
                        longitude: journeyData.end.longitude,
                        latitude: journeyData.end.latitude
                    },
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
    async updateJourneyV2(
        journeyData: UpdateJourneyDto,
        user_uid: string,
        journey_id: string
    ) {
        const disconnected = journeyData.deleted?.poi_ids;
        const experiences = [];
        const connected = [];
        journeyData.connected?.forEach((poiConnected) => {
            const id = poiConnected.node.id;
            delete poiConnected.node;
            connected.push({
                where: {
                    node: {
                        id: id
                    }
                },
                edge: poiConnected
            });
        });

        if (journeyData.deleted) {
            experiences.push({
                connect: connected,
                disconnect: [
                    {
                        where: {
                            node: {
                                id_IN: disconnected
                            }
                        }
                    }
                ]
            });
        }

        const input = {
            update: {
                experiences: experiences
            },
            where: {
                id: journey_id,
                creator: {
                    uid: user_uid
                }
            }
        };

        const resultUpdated = await this.journey.update(input);
        return resultUpdated.journeys[0];
    }

    async updateJourneys(journey: JourneyDto, user_uid: string) {
        const selectionSet = gql`
            {
                journeys {
                    id
                    title
                    description
                    thumbnail
                    creator {
                        uid
                        username
                    }
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
                    experiencesAggregate {
                        count
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
        experienceData: ExperienceDto,
        user_uid: string,
        journey_id: string
    ) {
        const node = experienceData.node;

        delete experienceData.node;

        const updated = await this.journey.update({
            where: {
                id: journey_id,
                creator: { uid: user_uid }
            },
            update: {
                experiences: [
                    {
                        update: {
                            edge: experienceData
                        },
                        where: {
                            node: {
                                id: node.id
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

    async removeExperience(experience: DeleteExperience, user_uid: string) {
        if (experience.journey == undefined || experience.poi == undefined) {
            throw new BadRequestException("Journey not included");
        }

        const selectionSet = gql`
            {
                journeys {
                    id
                    title
                    description
                    thumbnail
                    creator {
                        uid
                        username
                    }
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
                    }
                }
            }
        `;
        const updated = await this.journey.update({
            selectionSet: selectionSet,
            where: {
                id: experience.journey.id,
                creator: { uid: user_uid }
            },
            disconnect: {
                experiences: {
                    where: {
                        node: {
                            id: experience.poi.id
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
        journeyData: ExperienceDto,
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
                                id: journeyData.node.id
                            }
                        },
                        edge: journeyData
                    }
                ]
            }
        });

        if (added.length == 0) {
            throw new BadRequestException();
        }
        return added;
    }

    async setImage(
        exp: {
            journey: string;
            poi: string;
            url: string;
        },
        user: string
    ) {
        const input = {
            update: {
                experiences: {
                    update: {
                        edge: {
                            images_PUSH: exp.url
                        }
                    },
                    where: {
                        node: {
                            id: exp.poi
                        }
                    }
                }
            },
            where: {
                id: exp.journey,
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
