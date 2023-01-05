import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Node } from "neo4j-driver";
import { Entity } from "../../utilities/BaseEntity";
export class ImageNode {
    constructor(private readonly node: Node) {}

    get properties(): Image {
        if (this.node) return <Image>this.node.properties;
        return null;
    }

    get id(): string {
        if (this.properties) return this.properties.id;
        return null;
    }
    get url(): string {
        if (this.properties) return this.properties.url;
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
    url: string;

    @ApiProperty()
    thumbnail: string;
}
