import { ApiProperty } from "@nestjs/swagger";
import { JourneyDto } from "../../journey/dto/journey.dto";
import { Relationship, Node } from "neo4j-driver";
import { Entity } from "../../utilities/BaseEntity";

export class UserNode {
    constructor(
        private readonly node: Node,
        private readonly journeysRelationships: Relationship[],
        private readonly poisRelationships: Relationship[]
    ) {}

    getUid(): string {
        return (<Record<string, any>>this.node.properties).uid;
    }

    getUsername(): string {
        return (<Record<string, any>>this.node.properties).username;
    }

    getFirstname(): string {
        return (<Record<string, any>>this.node.properties).firstname;
    }

    getLastname(): string {
        return (<Record<string, any>>this.node.properties).lastname;
    }

    getVisibility(): "private" | "public" {
        return (<Record<string, any>>this.node.properties).visibility;
    }

    getProperties(): any {
        return this.node.properties;
    }
    getJourneysRelationships(): Relationship[] {
        return this.journeysRelationships;
    }

    getPoiRelationships(): Relationship[] {
        return this.poisRelationships;
    }
}
export class User extends Entity {
    @ApiProperty()
    uid: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    firstname: string;

    @ApiProperty()
    lastname: string;

    @ApiProperty()
    visibility: "private" | "public";
}
