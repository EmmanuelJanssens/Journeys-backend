import { Injectable } from "@nestjs/common";
import { Experience } from "src/experience/entities/experience.entity";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PoiNode, PointOfInterest } from "./entities/point-of-interest.entity";
import { PoiRepository } from "./point-of-interest.repository";
import { Tag, TagNode } from "src/tag/entities/tag.entity";
import { Integer } from "neo4j-driver";
@Injectable()
export class PointOfInterestService {
    constructor(private poiRepository: PoiRepository) {}

    /**
     *  Create a new Point of Interest
     * @param user the user who creates the poi
     * @param createPointOfInterestDto  the data of the poi
     * @returns a PointOfInterestDto
     */
    async create(
        user: string,
        createPointOfInterestDto: CreatePointOfInterestDto
    ) {
        const queryResult = await this.poiRepository.create(
            user,
            createPointOfInterestDto
        );
        const poiNode = new PoiNode(queryResult.records[0].get("poi"));
        const poi = poiNode.properties;
        let tags = [];
        if (queryResult.records[0].get("tags").length > 0)
            tags = queryResult.records[0]
                .get("tags")
                .map((tag) => new TagNode(tag).properties as Tag);

        return {
            poi,
            tags
        };
    }

    async findAll(
        center: {
            lat: number;
            lng: number;
        },
        radius: number
    ) {
        const queryResult = await this.poiRepository.getPoisInRadius(
            center,
            radius
        );
        const pois: {
            poi: PointOfInterest;
            tags: Tag[];
            thumbnail: string;
            expCount: Integer;
        }[] = [];
        queryResult.records.forEach((record) => {
            const poiNode = new PoiNode(record.get("poi"));
            const poi = poiNode.properties;
            const tags = record.get("tags").map((tag) => tag.properties as Tag);
            const expCount = record.get("expCount");
            const thumbnail = record.get("images")[0];
            pois.push({
                poi,
                tags: tags,
                thumbnail: thumbnail,
                expCount: expCount
            });
        });
        return pois;
    }

    /**
     * Find a poi by id
     * @param id the id of the poi
     * @returns a PointOfInterestDto with all the experiences and tags
     * */
    async findOne(id: string) {
        const queryResult = await this.poiRepository.get(id);
        const poiNode = new PoiNode(queryResult.records[0].get("poi"));
        const poi = poiNode.properties;
        const tags = queryResult.records[0]
            .get("tags")
            .map((tag) => tag.properties);
        const experiences = queryResult.records[0]
            .get("experiences")
            .map((exp) => exp.properties as Experience);

        return {
            poi,
            tags,
            experiences
        };
    }

    async getThumbnail(id: string) {
        const queryResult = await this.poiRepository.getThumbnail(id);
        if (queryResult.records.length > 0) return queryResult.records;
        else return "placeholder.png";
    }
}
