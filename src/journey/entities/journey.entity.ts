import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "../../entities/Locality";
import { Node } from "neo4j-driver";
import { Point } from "neo4j-driver-core";
import { Relationship } from "neo4j-driver-core";
import { ExperienceDto } from "src/experience/entities/experience.entity";

export class JourneyNode {
    constructor(
        private readonly node: Node,
        private readonly experiencesRelationShip?: Relationship[]
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

    @ApiProperty()
    visibility: "public" | "private";

    @ApiProperty()
    start: Point | Locality;

    @ApiProperty()
    end: Point | Locality;

    @ApiProperty()
    creator: string;
}
