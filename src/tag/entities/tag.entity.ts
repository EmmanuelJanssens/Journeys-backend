import { ApiProperty } from "@nestjs/swagger";
import { Node } from "neo4j-driver";
import { Entity } from "../../utilities/BaseEntity";

export class TagNode {
    constructor(private readonly node: Node) {}

    get properties() {
        return this.node.properties as Tag;
    }
    get type(): string {
        return this.properties.type;
    }
}
export class Tag extends Entity {
    @ApiProperty()
    type: string;
}
