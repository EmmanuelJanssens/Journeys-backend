import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { gql } from "apollo-server-express";
import {
    DeleteExperience,
    ExperienceDto,
    JourneyDto,
    UpdateJourneyDto
} from "src/data/dtos";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyModel } from "src/neo4j/neo4j.utils";
import * as uuid from "uuid";
@Injectable()
export class JourneyService {
    constructor(private readonly neo4jService: Neo4jService) {}

    private journey = JourneyModel(this.neo4jService.getOGM());

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
                (a, b) => a.order - b.order
            );
            return result;
        }
    }

    async addJourney(
        journeyData: JourneyDto,
        user_uid: string
    ): Promise<string> {
        const connections = [];
        journeyData.experiencesConnection.edges.forEach((element) => {
            const id = element.node.id;
            delete element.node;

            connections.push({
                where: {
                    node: {
                        id: id
                    }
                },
                edge: element
            });
        });
        const input = {
            input: [
                {
                    id: uuid.v4(),
                    title: journeyData.title,
                    description: journeyData.description,
                    start: {
                        connectOrCreate: {
                            where: {
                                node: {
                                    placeId: journeyData.start.placeId
                                }
                            },
                            onCreate: {
                                node: {
                                    address: journeyData.start.address,
                                    longitude: journeyData.start.longitude,
                                    latitude: journeyData.start.latitude
                                }
                            }
                        }
                    },
                    end: {
                        connectOrCreate: {
                            where: {
                                node: {
                                    placeId: journeyData.end.placeId
                                }
                            },
                            onCreate: {
                                node: {
                                    address: journeyData.end.address,
                                    longitude: journeyData.end.longitude,
                                    latitude: journeyData.end.latitude
                                }
                            }
                        }
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
    async updateJourneyV2(journeyData: UpdateJourneyDto, user_uid: string) {
        const disconnected = journeyData.deleted?.poi_ids;
        const experiences = [];
        const connected = [];
        //add all conencted nodes with default order
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

        //add all updated nodes
        journeyData.updated?.forEach((update) => {
            const id = update.node.id;
            delete update.node;
            experiences.push({
                update: {
                    edge: update
                },
                where: {
                    node: {
                        id: id
                    }
                }
            });
        });
        const input = {
            update: {
                experiences: experiences,
                title: journeyData.journey.title,
                description: journeyData.journey.description,
                thumbnail: journeyData.journey.thumbnail
            },
            where: {
                id: journeyData.journey.id,
                creator: {
                    uid: user_uid
                }
            }
        };
        if (!journeyData.journey.description) {
            delete input.update?.description;
        }

        const resultUpdated = await this.journey.update(input);
        return resultUpdated.journeys[0];
    }

    async updateExperience(experienceData: ExperienceDto, user_uid: string) {
        if (experienceData.journey == undefined) {
            throw new BadRequestException("Journey not included");
        }
        const node = experienceData.node;
        const journeyId = experienceData.journey.id;

        delete experienceData.node;
        delete experienceData.journey;

        const updated = await this.journey.update({
            where: {
                id: journeyId,
                creator: { user_uid: user_uid }
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

        const updated = await this.journey.update({
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
    async addExperience(journeyData: ExperienceDto, user_uid: string) {
        if (journeyData.journey == undefined) {
            throw new BadRequestException("Journey not included");
        }

        const added = await this.journey.update({
            where: {
                id: journeyData.journey.id,
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

    async deleteJourney(id: string) {
        if (id === undefined || id === "")
            throw new BadRequestException("Journey not found");
        const deleted = await this.journey.delete({
            where: { id: id }
        });

        return deleted;
    }
}
