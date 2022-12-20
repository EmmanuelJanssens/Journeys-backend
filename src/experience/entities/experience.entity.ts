import { PartialType } from "@nestjs/swagger";
import { Node } from "neo4j-driver";

export class ExperienceNode {
    constructor(private node: Node) {}

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
}

export class Experience {
    id: string;
    title: string;
    description: string;
    date: Date;
    images: string[];
}

export class ExperienceDto extends PartialType(Experience) {
    poiId: string;
    journeyId: string;
}
