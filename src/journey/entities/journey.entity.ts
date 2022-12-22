import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, isString, IsString, IsUUID } from "class-validator";
import { Node } from "neo4j-driver";
import { Point } from "neo4j-driver-core";
import { Relationship } from "neo4j-driver-core";
import { Locality } from "../../utilities/Locality";

export class JourneyNode {
    constructor(
        private readonly node: Node,
        private readonly experiencesRelationShip?: Relationship[]
    ) {}

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
    get thumbnail(): string {
        return this.properties.thumbnail;
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

    getExperiencesRelationships(): Relationship[] {
        return this.experiencesRelationShip;
    }
}

export class Journey {
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
    thumbnail: string;

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
