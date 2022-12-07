import {
    BadRequestException,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { UserModel } from "src/neo4j/neo4j.utils";
import { JwtService } from "@nestjs/jwt";

import { FirebaseService } from "src/firebase/firebase.service";
import { User, Authenticated } from "src/model/User";
import { RegisterUserDo } from "./dto/RegisterUserDto";
@Injectable()
export class AuthenticationService {
    constructor(
        private neo4jService: Neo4jService,
        private jwtService: JwtService,
        private fbService: FirebaseService
    ) {}

    private user = UserModel(this.neo4jService.getOGM());

    async registerWithProvider(user: User) {
        const result: User[] = await this.user.find({
            where: { uid: user.uid }
        });
        if (result.length == 0) {
            const created: { users: User[] } = await this.user.create({
                input: [
                    {
                        uid: user.uid,
                        username: user.username,
                        firstName: user.firstname,
                        lastName: user.lastname,
                        visibility: "public",
                        completed: false
                    }
                ]
            });
            if (created.users.length > 1 || created.users.length == 0)
                throw new BadRequestException();
            const result: Authenticated = {
                username: user.username,
                uid: user.uid
            };
            return result;
        } else {
            return user;
        }
    }

    async register(user: RegisterUserDo) {
        const result: User[] = await this.user.find({
            where: { uid: user.uid }
        });
        if (result.length >= 1) {
            throw new Error("User already exists");
        } else {
            const created: { users: User[] } = await this.user.create({
                input: [
                    {
                        uid: user.uid,
                        username: user.username,
                        firstName: user.firstname,
                        lastName: user.lastname,
                        visibility: "public",
                        completed: user.completed
                    }
                ]
            });

            if (created.users.length > 1 || created.users.length == 0)
                throw new BadRequestException();

            return created.users[0];
        }
    }
}
