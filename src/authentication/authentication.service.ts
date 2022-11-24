import { BadRequestException, Injectable } from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { UserModel } from "src/neo4j/neo4j.utils";
import { UserDto } from "src/data/dtos";
import { JwtService } from "@nestjs/jwt";

import { FirebaseService } from "src/firebase/firebase.service";
import { Authenticated } from "./dto/Authenticated.interface";
@Injectable()
export class AuthenticationService {
    constructor(
        private neo4jService: Neo4jService,
        private jwtService: JwtService,
        private fbService: FirebaseService
    ) {}

    private user = UserModel(this.neo4jService.getOGM());

    async validateUser(username: string): Promise<Authenticated> {
        const foundUser: UserDto = (
            await this.user.find({
                where: { username: username }
            })
        )[0];
        if (foundUser) {
            const result: Authenticated = {
                username: foundUser.username,
                email: foundUser.email,
                uid: foundUser.uid
            };
            return result;
        }
        throw new Error("Something went wrong");
    }

    async register(userData: UserDto) {
        const result: UserDto[] = await this.user.find({
            where: { username: userData.username }
        });
        if (result.length >= 1) {
            throw new Error("User already exists");
        } else {
            const fbUser = await this.fbService.getApp().auth().createUser({
                email: userData.email,
                emailVerified: false,
                displayName: userData.username,
                password: userData.password
            });

            const created: { users: UserDto[] } = await this.user.create({
                input: [
                    {
                        uid: fbUser.uid,
                        username: userData.username,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        public: true
                    }
                ]
            });

            if (created.users.length > 1 || created.users.length == 0)
                throw new BadRequestException();

            const result: Authenticated = {
                username: userData.username,
                email: userData.email,
                uid: fbUser.uid
            };
            return result;
        }
    }
}
