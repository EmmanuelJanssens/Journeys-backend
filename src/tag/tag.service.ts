import { Injectable } from "@nestjs/common";
import { gql } from "apollo-server-core";
import {
    PointOfInterest,
    transformPoiResponse
} from "src/model/PointOfInterest";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { TagModel } from "src/neo4j/neo4j.utils";

@Injectable()
export class TagService {
    constructor(private readonly neo4jService: Neo4jService) {
        //
    }

    tag = TagModel(this.neo4jService.getOGM());
    async getAll() {
        const selectionSet = gql`
            {
                type
                poisAggregate {
                    count
                }
            }
        `;
        const result = await this.tag.find({ selectionSet });
        const tags: { type: string; count: number }[] = [];
        result.forEach((element) => {
            tags.push({
                type: element.type,
                count: element.poisAggregate.count
            });
        });
        tags.sort((fst, snd) => snd.count - fst.count);
        return tags;
    }

    async getPoiFor(tag: string[]) {
        const selectionSet = gql`
            {
                type
                poisConnection {
                    edges {
                        node {
                            id
                            name
                            location {
                                latitude
                                longitude
                            }
                            tags {
                                type
                            }
                        }
                    }
                }
            }
        `;
        const condition = {
            type_IN: tag
        };
        const result = await this.tag.find({
            selectionSet,
            where: condition
        });
        const tags = {
            forTags: tag,
            pois: []
        };
        if (tag.length > 0) {
            result.forEach((element) => {
                element.poisConnection.edges.forEach((edge) => {
                    tags.pois.push(transformPoiResponse(edge.node));
                });
            });
        }
        return tags;
    }
}
