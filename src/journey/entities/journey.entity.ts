import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "entities/Locality";
import { PointOfInterest } from "point-of-interest/entities/point-of-interest.entity";
import { Experience } from "entities/experience.entity";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";
import { Node } from "neo4j-driver";
import { Point } from "neo4j-driver-core";
import { Relationship } from "neo4j-driver-core";

export class JourneyNode {
    constructor(
        private readonly node: Node,
        private readonly experiencesRelationShip: Relationship[]
    ) {}

    getId(): string {
        return (<Record<string, any>>this.node.properties).id;
    }
    getTitle(): string {
        return (<Record<string, any>>this.node.properties).title;
    }
    getDescription(): string {
        return (<Record<string, any>>this.node.properties).description;
    }
    getThumbnail(): string {
        return (<Record<string, any>>this.node.properties).thumbnail;
    }
    getVisibility(): string {
        return (<Record<string, any>>this.node.properties).visibility;
    }
    getStart(): Point {
        return (<Record<string, any>>this.node.properties).start;
    }
    getEnd(): Point {
        return (<Record<string, any>>this.node.properties).end;
    }

    getExperiencesRelationships(): Relationship[] {
        return this.experiencesRelationShip;
    }
    getProperties(): any {
        return this.node.properties;
    }
}

export class Journey {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    thumbnail: string;

    thumbnails: string[];

    @ApiProperty()
    visibility: "public" | "private";

    @ApiProperty()
    start: Locality;

    @ApiProperty()
    end: Locality;

    @ApiProperty()
    creator: string;

    experiencesAggregate: { count: number };

    @ApiProperty()
    experiences: {
        experience: Experience;
        poi: PointOfInterestDto;
    }[];
}
