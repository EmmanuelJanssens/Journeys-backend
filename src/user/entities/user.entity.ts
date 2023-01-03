import { ApiProperty } from "@nestjs/swagger";
import { Node } from "neo4j-driver";
import { Entity } from "../../utilities/BaseEntity";
import { NotFoundError } from "src/errors/Errors";

export class UserNode {
    constructor(private readonly node: Node) {
        if (node === undefined || node === null) {
            throw new NotFoundError("user node is undefined or null");
        }
    }

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
