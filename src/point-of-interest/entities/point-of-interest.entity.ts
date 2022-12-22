import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Node, Point } from "neo4j-driver";
import { Experience } from "../../experience/entities/experience.entity";
import { Locality } from "../../utilities/Locality";

export class PoiNode {
    constructor(private readonly node: Node) {}

    get properties(): PointOfInterest {
        return this.node.properties as PointOfInterest;
    }

    get id(): string {
        return this.properties.id;
    }
    get name(): string {
        return this.properties.name;
    }
    get location(): Point {
        return this.properties.location as Point;
    }
}

export class PointOfInterest {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    location: Locality | Point;

    @ApiProperty()
    @IsArray()
    tags: string[];
}
