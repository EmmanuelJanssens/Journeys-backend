import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Node, Point } from "neo4j-driver";
import { NotFoundError } from "../../errors/Errors";
import { Entity } from "../../utilities/BaseEntity";
import { Locality } from "../../utilities/Locality";

export class PoiNode {
    constructor(private readonly node: Node) {
        if (node == null || node == undefined) {
            throw new NotFoundError("Point of interest not found");
        }
    }

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

export class PointOfInterest extends Entity {
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
}
