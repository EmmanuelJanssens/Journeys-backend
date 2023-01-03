import { Injectable } from "@nestjs/common";
import { Experience } from "../experience/entities/experience.entity";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PoiNode, PointOfInterest } from "./entities/point-of-interest.entity";
import { PoiRepository } from "./point-of-interest.repository";
import { Tag, TagNode } from "../tag/entities/tag.entity";
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
        const poi = queryResult.poi.properties;
        const tags = queryResult.tags.map((tag) => tag.properties);

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
        const poisPromise = queryResult.pois.map(async (data) => {
            return {
                poi: data.poi.properties,
                tags: data.tags.map((tag) => tag.properties),
                thumbnails: await this.getThumbnail(data.poi.properties.id),
                expCount: data.expCount
            };
        });
        const pois = await Promise.all(poisPromise);
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

        return {
            thumbnails: queryResult.thumbnails.map((thumb) => thumb.properties)
        };
    }
}
