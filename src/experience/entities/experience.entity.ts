import { Node } from "neo4j-driver";
import { NotFoundError } from "../../errors/Errors";

export class ExperienceNode {
    constructor(private readonly node: Node) {
        if (node == undefined || node == null) {
            throw new NotFoundError("Experience not found");
        }
    }

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
}
