import { BadRequestException, Injectable } from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { User } from "src/neo4j/neo4j.utils";
import * as bcrypt from "bcrypt";
import { UserDto } from "src/data/dtos";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthenticationService {
    constructor(
        private neo4jService: Neo4jService,
        private jwtService: JwtService
    ) {}

    private user = User(this.neo4jService.getOGM());

    async validateUser(
        username: string,
        password: string
    ): Promise<{
        username: string;
        token: string;
    }> {
        const foundUser: UserDto[] = await this.user.find({
            where: { username: username }
        });
        if (foundUser.length === 1) {
            // test password
            const validPwd =
                (await bcrypt.compare(password, foundUser[0].password)) &&
                foundUser[0].username === username;

            if (validPwd) {
                const payload = {
                    username: foundUser[0].username
                };
                const token = this.jwtService.sign(payload);
                return {
                    username,
                    token
                };
            }
            throw new Error("Bad credentials");
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
            const hash = await bcrypt.hash(userData.password, 10);
            const created: { users: UserDto[] } = await this.user.create({
                input: [
                    {
                        username: userData.username,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        password: hash
                    }
                ]
            });
            if (created.users.length > 1 || created.users.length == 0)
                throw new BadRequestException();

            const payload = {
                username: userData.username
            };
            const token = this.jwtService.sign(payload);

            return {
                username: userData.username,
                token
            };
        }
    }
}
