import { Injectable } from "@nestjs/common";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { TagDto } from "./dto/tag.dto";
import { TagNode } from "./entities/tag.entity";
import { TagRepository } from "./tag.repository";

@Injectable()
export class TagService {
    constructor(private readonly tagRepository: TagRepository) {}

    /**
     * find all tags
     * @returns
     */
    async findAll(): Promise<any> {
        const queryResult = await this.tagRepository.findall();
        const tags = [];
        queryResult.records.forEach((record) => {
            const tag = record.get("t");
            tags.push(tag.properties.type);
        });
        return tags;
    }
    /**
     * find all tags with their respective pois
     * @param tags
     * @returns
     */
    async findWithPois(tags: string[]): Promise<any> {
        const queryResult = await this.tagRepository.findWithPois(tags);
        const tagsWithPois: TagDto[] = [];
        queryResult.records.forEach((record) => {
            const tag = new TagNode(record.get("t"));
            tagsWithPois.push({
                type: tag.type,
                tagAggregate: {
                    poiCount: record.get("poiCount").low
                }
            });
        });
        return tagsWithPois;
    }
}
