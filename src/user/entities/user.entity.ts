import { JourneyDto } from "journey/dto/journey.dto";
import { Relationship, Node } from "neo4j-driver";

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
export class User {
    uid: string;
    username: string;
    firstname: string;
    lastname: string;
    visibility: "private" | "public";
    journeys: JourneyDto[];
    journeysAggregate: { count: number };
    poisAggregate: { count: number };
}
