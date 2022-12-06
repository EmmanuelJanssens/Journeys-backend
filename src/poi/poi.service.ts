import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { gql } from "apollo-server-express";
import { UpdateJourneyDto } from "src/journey/dto/UpdateJourneyDto";
import { Experience } from "src/model/Experience";
import {
    PartialPOI,
    PointOfInterest,
    transformPoiResponse
} from "src/model/PointOfInterest";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { PoiModel } from "src/neo4j/neo4j.utils";
import * as uuid from "uuid";
import { FindPoisArroundDto } from "./dto/SearchPoiDto";
@Injectable()
export class PoiService {
    constructor(private readonly neo4jService: Neo4jService) {}

    private poi = PoiModel(this.neo4jService.getOGM());

    private logger = new Logger(PoiService.name);
    async getPoisCountBetween(pois: FindPoisArroundDto) {
        let result = 0;

        const selectionSet = gql`
            {
                id
            }
        `;

        const condition = {
            location_LT: {
                point: pois.location,
                distance: pois.radius
            }
        };
        const req = await this.neo4jService.readGql(
            this.poi,
            selectionSet,
            condition
        );
        result = (req as any[]).length;
        return result;
    }
    async getPois(search: FindPoisArroundDto) {
        const selectionSet = gql`
            {
                id
                name
                location {
                    longitude
                    latitude
                }
                journeysConnection {
                    edges {
                        images
                    }
                }
                tags {
                    type
                }
            }
        `;

        const condition = {
            location_LT: {
                point: search.location,
                distance: search.radius
            }
        };

        const results = await this.neo4jService.readGql<any[]>(
            this.poi,
            selectionSet,
            condition
        );
        results.forEach((p) => {
            const tags = [];

            if (
                p.journeysConnection.edges?.length > 0 &&
                p.journeysConnection.edges[0].images?.length > 0
            ) {
                p.thumbnail = p.journeysConnection.edges[0].images[0];
            } else {
                p.thumbnail = "/assets/placeholder.png";
            }
            p.tags.forEach((t) => {
                tags.push(t.type);
            });
            delete p.journeysConnection;
            p.tags = tags;
        });

        return results;
    }

    async addPoi(poiData: PointOfInterest, userUid: string) {
        const selectionSet = gql`
            {
                id
                name
                location {
                    longitude
                    latitude
                }
                tags {
                    type
                }
            }
        `;
        const id = uuid.v4();

        const connectOrCreate = [];
        poiData.tags.forEach((tag) => {
            connectOrCreate.push({
                where: {
                    node: {
                        type: tag
                    }
                },
                onCreate: {
                    node: {
                        _emptyInput: false
                    }
                }
            });
        });
        await this.poi.create({
            input: [
                {
                    id: id,
                    name: poiData.name,
                    location: poiData.location,
                    tags: { connectOrCreate },
                    creator: {
                        connect: {
                            where: {
                                node: {
                                    uid: userUid
                                }
                            }
                        }
                    }
                }
            ]
        });
        const res = await this.poi.find({
            where: {
                id: id
            },
            selectionSet: selectionSet
        });

        return transformPoiResponse(res[0]);
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
                journeysConnection(
                    where: { node: { creator: { visibility: "public" } } }
                ) {
                    edges {
                        date
                        description
                        images
                        title
                    }
                }
            }
        `;

        const condition = {
            id
        };
        const result = await this.neo4jService.readGql(
            this.poi,
            selectionSet,
            condition
        );
        const experiences: Experience[] = [];
        result[0].journeysConnection.edges.forEach((experience) => {
            experiences.push(experience);
        });
        return experiences;
    }
    async getRandomThumbnail(poi: PartialPOI) {
        const selectionSet = gql`
            {
                journeysConnection {
                    edges {
                        images
                    }
                }
            }
        `;
        const condition = {
            id: poi.id
        };

        const result = await this.neo4jService.readGql(
            this.poi,
            selectionSet,
            condition
        );

        if (result[0].journeysConnection.edges.length == 0)
            return {
                url: "https://firebasestorage.googleapis.com/v0/b/journeys-v2/o/images%2Fplaceholder.png?alt=media&token=c921b603-8028-42d4-a7a3-7b186f427c98"
            };
        const image = result[0].journeysConnection.edges[0].images[0];
        return { url: image };
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
                journeysConnection(where: {node :{ creator: {visibility: "public"}}}, first:${pageSize}, after:  ${cursor} ){
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
            where: {
                id: id
            }
        });
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
                    (experience) => ({
                        journey: {
                            id: experience.node.id,
                            title: experience.node.title,
                            creator: experience.node.creator
                        } as UpdateJourneyDto,
                        experience: {
                            date: experience.date,
                            description: experience.description,
                            images: experience.images,
                            order: experience.order
                        }
                    })
                ),
                pageInfo: pois[0].journeysConnection.pageInfo
            };
            return result;
        }
    }
}
