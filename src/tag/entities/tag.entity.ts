import { Relationship, Node } from "neo4j-driver";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";

export class TagNode {
    constructor(
        private readonly node: Node,
        private readonly poisRelationships: Relationship[]
    ) {}

    getType(): string {
        return (<Record<string, any>>this.node.properties).type;
    }

    getPoisRelationships(): Relationship[] {
        return this.poisRelationships;
    }
}
export class Tag {
    type: string;
    tagAggregate: {
        count: number;
    };
    pois: PointOfInterestDto[];
}
