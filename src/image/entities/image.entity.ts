import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { Node } from "neo4j-driver";
export class ImageNode {
    constructor(private readonly node: Node) {}

    get properties(): Image {
        return <Image>this.node.properties;
    }

    get id(): string {
        return this.properties.id;
    }
    get original(): string {
        return this.properties.original;
    }
    get thumbnail(): string {
        return this.properties.thumbnail;
    }
}

export class Image {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    original: string;

    @ApiProperty()
    thumbnail: string;
}
