import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { gql } from "apollo-server-express";
import { ExperienceDto, JourneyDto, UpdateJourneyDto } from "src/data/dtos";
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
                creator {
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
            const result = {
                id: j[0].id,
                title: j[0].title,
                creator: j[0].creator,
                start: j[0].start,
                end: j[0].end,
                experiencesCount: j[0].experiencesAggregate.count,
                experiences: j[0].experiencesConnection.edges.map(
                    (experience) => ({
                        poi: experience.node,
                        experience: {
                            title: experience.title,
                            date: experience.date,
                            description: experience.description,
                            images: experience.images,
                            order: experience.order
                        },
                        id: experience.node.id
                    })
                ),
                pageInfo: j[0].experiencesConnection.pageInfo
            };

            result.experiences.sort(
                (a, b) => a.experience.order - b.experience.order
            );
            return result;
        }
    }

    async addJourney(
        journeyData: JourneyDto,
        username: string
    ): Promise<string> {
        const connections = [];
        journeyData.experiences.forEach((element) => {
            connections.push({
                where: {
                    node: {
                        id: element.poi.id
                    }
                },
                edge: element.experience
            });
        });

        const created = await this.journey.create({
            input: [
                {
                    id: uuid.v4(),
                    title: journeyData.title,
                    start: {
                        connectOrCreate: {
                            where: {
                                node: {
                                    address: journeyData.start.address
                                }
                            },
                            onCreate: {
                                node: {
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
                                    address: journeyData.end.address
                                }
                            },
                            onCreate: {
                                node: {
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
                                    username: username
                                }
                            }
                        }
                    }
                }
            ]
        });
        return created.journeys[0].id;
    }
    async updateJourneyV2(journeyData: UpdateJourneyDto, username: string) {
        const connected = journeyData.connected.poi_ids;
        const disconnected = journeyData.deleted.poi_ids;
        const experiences = [];
        experiences.push({
            connect: [
                {
                    where: {
                        node: {
                            id_IN: connected
                        }
                    }
                }
            ],
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
        journeyData.updated.forEach((update) => {
            experiences.push({
                update: {
                    edge: update.experience
                },
                where: {
                    node: {
                        id: update.poi.id
                    }
                }
            });
        });
        const input = {
            update: {
                experiences: experiences,
                title: journeyData.journey.title,
                description: journeyData.journey.description
            },
            where: {
                id: journeyData.journey.id,
                creator: {
                    username: username
                }
            }
        };
        if (journeyData.journey.title == undefined) {
            delete input.update.title;
        }
        if (journeyData.journey.description == undefined) {
            delete input.update.description;
        }
        const resultUpdated = await this.journey.update(input);

        return resultUpdated;
    }
    async updateJourney(journeyData: JourneyDto, username) {
        console.log(journeyData);
        const experiences = [];

        journeyData.experiences.forEach((experience) => {
            experiences.push({
                where: {
                    node: {
                        id: experience.poi.id
                    }
                },
                update: {
                    edge: {
                        title: experience.experience.title,
                        images: experience.experience.images,
                        description: experience.experience.description,
                        order: experience.experience.order,
                        date: experience.experience.date
                    }
                }
            });
        });
        const updated = await this.journey.update({
            where: {
                id: journeyData.id,
                creator: { username: username }
            },
            update: {
                title: journeyData.title,
                experiences: experiences
            }
        });

        return updated;
    }

    async updateExperience(journeyData: ExperienceDto, username: string) {
        console.log(journeyData.experience);
        if (journeyData.journey == undefined) {
            throw new BadRequestException("Journey not included");
        }
        const updated = await this.journey.update({
            where: {
                id: journeyData.journey.id,
                creator: { username: username }
            },
            connect: {
                experiences: [
                    {
                        where: {
                            node: {
                                id: journeyData.poi.id
                            }
                        },
                        edge: journeyData.experience
                    }
                ]
            }
        });

        if (updated.length == 0) {
            throw new BadRequestException();
        }
        return updated.journeys[0];
    }

    async removeExperience(experience: ExperienceDto, username: string) {
        if (experience.journey == undefined) {
            throw new BadRequestException("Journey not included");
        }

        const updated = await this.journey.update({
            where: {
                id: experience.journey.id,
                creator: { username: username }
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
    async addExperience(journeyData: ExperienceDto, username: string) {
        if (journeyData.journey == undefined) {
            throw new BadRequestException("Journey not included");
        }

        const added = await this.journey.update({
            where: {
                id: journeyData.journey.id,
                creator: { username: username }
            },
            update: {
                experiences: [
                    {
                        where: {
                            node: {
                                id: journeyData.poi.id
                            }
                        },
                        edge: journeyData.experience
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
