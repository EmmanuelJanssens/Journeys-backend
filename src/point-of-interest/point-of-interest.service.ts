import { Injectable } from "@nestjs/common";
import { Experience } from "../entities/experience.entity";
import { PointToLocation } from "../entities/utilities";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { PointOfInterestDto } from "./dto/point-of-interest.dto";
import { PoiNode } from "./entities/point-of-interest.entity";
import { PoiRepository } from "./point-of-interest.repository";

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
        const poiNode = new PoiNode(
            queryResult.records[0].get("poi"),
            [],
            queryResult.records[0].get("tags")
        );
        const createdPoi = poiNode.getProperties() as PointOfInterestDto;
        createdPoi.tags = [];
        poiNode.getTagsRelationships().forEach((rel) => {
            createdPoi.tags.push(rel.properties.type);
        });
        createdPoi.location = PointToLocation(poiNode.getLocation());

        return createdPoi;
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
        const poisFound: PointOfInterestDto[] = [];
        queryResult.records.forEach((record) => {
            const poiNode = new PoiNode(
                record.get("poi"),
                [],
                record.get("tags")
            );
            const foundPoi = poiNode.getProperties() as PointOfInterestDto;
            foundPoi.tags = [];
            poiNode.getTagsRelationships().forEach((rel) => {
                foundPoi.tags.push(rel.properties.type);
            });
            foundPoi.experiencesAggregate = {
                count: record.get("expCount").low
            };
            foundPoi.location = PointToLocation(poiNode.getLocation());
            foundPoi.thumbnail =
                record.get("images")?.length > 0
                    ? record.get("images")[0]
                    : "/assets/placeholder.png";
            poisFound.push(foundPoi);
        });
        return poisFound;
    }

    /**
     * Find a poi by id
     * @param id the id of the poi
     * @returns a PointOfInterestDto with all the experiences and tags
     * */
    async findOne(id: string) {
        const queryResult = await this.poiRepository.get(id);
        const poiNode = new PoiNode(
            queryResult.records[0].get("poi"),
            queryResult.records[0].get("experiences"),
            queryResult.records[0].get("tags")
        );
        const foundPoi = poiNode.getProperties() as PointOfInterestDto;
        foundPoi.tags = [];
        foundPoi.experiences = [];
        poiNode.getTagsRelationships().forEach((rel) => {
            foundPoi.tags.push(rel.properties.type);
        });
        poiNode.getExperiencesRelationships().forEach((rel) => {
            foundPoi.experiences.push(rel.properties as Experience);
        });
        foundPoi.location = PointToLocation(poiNode.getLocation());
        return foundPoi;
    }
}
