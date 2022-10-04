import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { gql } from "apollo-server-express";
import { ExperienceDto, JourneyDto } from "src/data/dtos";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { Journey } from "src/neo4j/neo4j.utils";
import * as uuid from "uuid";
@Injectable()
export class JourneyService {
    constructor(private readonly neo4jService: Neo4jService) {}

    private journey = Journey(this.neo4jService.getOGM());

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
                    userName
                }
            }
        `;

        const count = await this.journey.aggregate({
            aggregate: {
                count: 1
            }
        });
        const journeys = await this.journey.find({
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

        const j = await this.journey.find({
            selectionSet,
            where: { id }
        });

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
                        date: experience.date,
                        description: experience.description,
                        images: experience.images,
                        order: experience.order
                    })
                ),
                pageInfo: j[0].experiencesConnection.pageInfo
            };
            return result;
        }
    }

    async addJourney(journeyData: JourneyDto, username: string) {
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

        return created;
    }

    async updateJourney(journeyData: JourneyDto, username) {
        const updated = await this.journey.update({
            where: {
                id: journeyData.id,
                creator: { username: username }
            },
            update: {
                title: journeyData.title
            }
        });

        return updated;
    }

    async updateExperience(journeyData: ExperienceDto, username: string) {
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
        return updated;
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
}
