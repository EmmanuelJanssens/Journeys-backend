import { PartialType } from "@nestjs/swagger";
import { Relationship } from "neo4j-driver";

export class ExperienceRelation {
    constructor(private readonly relation: Relationship) {}

    getTitle(): string {
        return (<Record<string, any>>this.relation.properties).title;
    }
    getDate(): Date {
        return (<Record<string, any>>this.relation.properties).title;
    }
    getDescription(): string {
        return (<Record<string, any>>this.relation.properties).description;
    }
    getImages(): string[] {
        return (<Record<string, any>>this.relation.properties).images;
    }

    getStartNode() {
        return this.relation.start;
    }
    getEndNode() {
        return this.relation.end;
    }
    getRelation(): any {
        return this.relation;
    }
}

export class Experience {
    title: string;
    description: string;
    date: Date;
    images: string[];
}

export class ExperienceDto extends PartialType(Experience) {}
