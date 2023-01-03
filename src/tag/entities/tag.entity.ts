import { ApiProperty } from "@nestjs/swagger";
import { Node } from "neo4j-driver";
import { NotFoundError } from "src/errors/Errors";
import { Entity } from "../../utilities/BaseEntity";

export class TagNode {
    constructor(private readonly node: Node) {
        if (node == null || node == undefined) {
            throw new NotFoundError("Tag not found");
        }
    }

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
