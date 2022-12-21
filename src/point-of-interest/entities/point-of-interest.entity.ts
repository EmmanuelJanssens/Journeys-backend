import { ApiProperty } from "@nestjs/swagger";
import { Node, Point, Relationship } from "neo4j-driver";
import { Experience } from "../../experience/entities/experience.entity";
import { Locality } from "../../utilities/Locality";

export class PoiNode {
    constructor(
        private readonly node: Node,
        private readonly experienceRelationships?: Relationship[],
        private readonly tagsRelationShips?: Relationship[]
    ) {}

    getId(): string {
        return (<Record<string, any>>this.node.properties).id;
    }
    getName(): string {
        return (<Record<string, any>>this.node.properties).name;
    }
    getLocation(): Point {
        return (<Record<string, any>>this.node.properties).location;
    }
    getProperties(): any {
        return this.node.properties;
    }
    getTagsRelationships(): Relationship[] {
        return this.tagsRelationShips;
    }
    getExperiencesRelationships(): Relationship[] {
        return this.experienceRelationships;
    }
}

export class PointOfInterest {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    location: Locality | Point;

    @ApiProperty()
    tags: string[];

    @ApiProperty()
    experiencesAggregate: { count: number };

    @ApiProperty()
    experiences: Experience[];

    @ApiProperty()
    thumbnail: string;
}
