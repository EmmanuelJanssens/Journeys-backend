import { ApiProperty } from "@nestjs/swagger";
import { Node } from "neo4j-driver";

export class TagNode {
    constructor(private readonly node: Node) {}

    get properties() {
        return this.node.properties as Tag;
    }
    get type(): string {
        return this.properties.type;
    }
}
export class Tag {
    @ApiProperty()
    type: string;
}
