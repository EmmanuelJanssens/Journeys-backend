import { BadRequestException, Injectable } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { ExperienceDto, JourneyDto, PoiDto, UserDto } from "src/data/dtos";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { Poi } from "src/neo4j/neo4j.utils";
import uuid from "uuid";
@Injectable()
export class PoiService {
    constructor(private readonly neo4jService: Neo4jService) {}

    private poi = Poi(this.neo4jService.getOGM());

    async getPois(
        radius: number,
        lat: number,
        lng: number,
        page?: number,
        pageSize?: number
    ) {
        const options = {
            limit: pageSize,
            offset: page
        };

        const selectionSet = gql`
            {
                id
                name
                description
                location {
                    longitude
                    latitude
                }
            }
        `;

        const condition = {
            location_LT: {
                point: {
                    latitude: lat,
                    longitude: lng
                },
                distance: radius
            }
        };

        const results = await this.neo4jService.readGql(
            this.poi,
            selectionSet,
            condition,
            options
        );

        const result = {
            data: results as PoiDto[],
            pageInfo: {}
        };
        return result;
    }

    async addPoi(poiData) {
        const created = await this.poi.create({
            input: [
                {
                    id: uuid.v4(),
                    name: poiData.name,
                    location: {
                        latitude: poiData.location.latitude,
                        longitude: poiData.location.longitude
                    }
                }
            ]
        });
        return created;
    }

    async updatePoi(poiData) {
        const updated = await this.poi.update({
            where: { id: poiData.id },
            update: {
                name: poiData.name,
                location: poiData.location
            }
        });
        return updated;
    }

    async getPoi(id: string) {
        const selectionSet = gql`
            {
                id
                name
                location {
                    latitude
                    longitude
                }
            }
        `;

        const condition = {
            id
        };

        return this.neo4jService.readGql<PoiDto>(
            this.poi,
            selectionSet,
            condition
        );
    }

    async getPoiExperiences(
        id: string,
        cursor: string | undefined,
        pageSize: number
    ) {
        const selectionSet = gql`
            {
                id
                name
                location{
                    latitude
                    longitude
                }
                journeysAggregate{
                    count
                }
                journeysConnection(first:${pageSize}, after:  ${cursor} ){
                    edges{
                        date
                        description
                        images
                        order
                        node{
                            id
                            title
                            creator{
                                username
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
            }
            `;
        const pois = await this.poi.find({
            selectionSet,
            where: { id }
        });

        // make sure there is only one poi
        if (pois.length > 1) {
            throw new BadRequestException(
                "An error occured while fetching pois"
            );
        } else {
            const result = {
                id: pois[0].id,
                name: pois[0].name,
                location: pois[0].location,
                totalCount: pois[0].journeysAggregate.count,
                experiences: pois[0].journeysConnection.edges.map(
                    (experience) =>
                        ({
                            journey: {
                                id: experience.node.id,
                                title: experience.node.title,
                                creator: experience.node.creator
                            } as JourneyDto,
                            experience: {
                                date: experience.date,
                                description: experience.description,
                                image: experience.images,
                                order: experience.order
                            }
                        } as ExperienceDto)
                ),
                pageInfo: pois[0].journeysConnection.pageInfo
            };
            return result;
        }
    }
}
