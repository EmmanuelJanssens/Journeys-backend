import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Node } from "neo4j-driver";
import { Point } from "neo4j-driver-core";
import { NotFoundError } from "../../errors/Errors";
import { Entity } from "../../utilities/BaseEntity";
import { Locality } from "../../utilities/Locality";
export class JourneyNode {
    constructor(private readonly node: Node) {
        if (node === undefined || node === null) {
            throw new NotFoundError("journey node is undefined or null");
        }
    }

    get properties(): Journey {
        return this.node.properties as Journey;
    }

    get id(): string {
        return this.properties.id;
    }
    get title(): string {
        return this.properties.title;
    }
    get description(): string {
        return this.properties.description;
    }

    get visibility(): string {
        return this.properties.visibility;
    }
    get start(): Point {
        return <Point>this.properties.start;
    }
    get end(): Point {
        return <Point>this.properties.end;
    }
}

export class Journey extends Entity {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    visibility: "public" | "private";

    @ApiProperty()
    @IsNotEmpty()
    start: Point | Locality;

    @ApiProperty()
    @IsNotEmpty()
    end: Point | Locality;
}
