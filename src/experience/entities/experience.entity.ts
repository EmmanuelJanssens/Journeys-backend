import { Relationship } from "@neo4j/graphql/dist/classes";
import { PartialType } from "@nestjs/swagger";
import { Node } from "neo4j-driver";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";

export class ExperienceNode {
    constructor(
        private readonly node: Node,
        private readonly journeys?: Relationship[],
        private readonly pois?: Relationship[]
    ) {}

    get properties(): Experience {
        return this.node.properties as Experience;
    }
    get id(): string {
        return this.node.properties.id;
    }

    get title(): string {
        return this.node.properties.title;
    }
    get description(): string {
        return this.node.properties.description;
    }
    get date(): Date {
        return this.node.properties.date;
    }
    get images(): string[] {
        return this.node.properties.images;
    }

    get journeysRelationships(): Relationship[] {
        return this.journeys;
    }
    get poisRelationships(): Relationship[] {
        return this.pois;
    }
}

export class Experience {
    id: string;
    title: string;
    description: string;
    date: Date;
    images: string[];
}

export class ExperienceDto extends PartialType(Experience) {
    journey: string;
    poi: string | PointOfInterest;
}
