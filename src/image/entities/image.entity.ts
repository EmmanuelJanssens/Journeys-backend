import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Node } from "neo4j-driver";
import { NotFoundError } from "src/errors/Errors";
import { Entity } from "../../utilities/BaseEntity";
export class ImageNode {
    constructor(private readonly node: Node) {
        if (node == null || node == undefined)
            throw new NotFoundError("Image not found");
    }

    get properties(): Image {
        if (this.node) return <Image>this.node.properties;
        return null;
    }

    get id(): string {
        if (this.properties) return this.properties.id;
        return null;
    }
    get original(): string {
        if (this.properties) return this.properties.original;
        return null;
    }
    get thumbnail(): string {
        if (this.properties) return this.properties.thumbnail;
        return null;
    }
}

export class Image extends Entity {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    original: string;

    @ApiProperty()
    thumbnail: string;
}
