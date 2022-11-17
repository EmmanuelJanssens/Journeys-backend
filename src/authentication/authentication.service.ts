import { BadRequestException, Injectable } from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { UserModel } from "src/neo4j/neo4j.utils";
import * as bcrypt from "bcrypt";
import { UserDto } from "src/data/dtos";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class AuthenticationService {
    constructor(
        private neo4jService: Neo4jService,
        private jwtService: JwtService
    ) {}

    private user = UserModel(this.neo4jService.getOGM());

    async refreshToken(payload: { username: string; refresh: string }) {
        const foundUser: UserDto[] = await this.user.find({
            where: {
                username: payload.username
            }
        });
        try {
            this.jwtService.verify(payload.refresh, {
                secret: process.env.JWT_SECRET
            });
            if (bcrypt.compare(payload.refresh, foundUser[0].refreshToken)) {
                const token = this.jwtService.sign(
                    {
                        username: foundUser[0].username,
                        refreshToken: payload.refresh
                    },
                    { secret: process.env.JWT_SECRET }
                );
                return {
                    username: foundUser[0].username,
                    token: token,
                    refreshtoken: payload.refresh
                };
            } else {
                throw new Error("Authorization error");
            }
        } catch (e) {}
    }

    async generateRefreshToken(user: UserDto) {
        const refresh = this.jwtService.sign(user);
        return refresh;
    }
    async logoutUser(username: string) {
        const udpated = await this.user.update({
            where: {
                username: username
            },
            update: {
                refreshToken: null
            }
        });
        if (!udpated) throw Error("Something went wrong");

        return true;
    }

    async validateUser(
        username: string,
        password: string
    ): Promise<{
        username: string;
        token: string;
        refreshtoken: string;
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
                const refresh = this.jwtService.sign(
                    {
                        username: foundUser[0].username
                    },
                    { expiresIn: "30d" }
                );
                const encryptedRefreshToken = await bcrypt.hash(refresh, 10);
                const udpated = await this.user.update({
                    where: {
                        username: username
                    },
                    update: {
                        refreshToken: encryptedRefreshToken
                    }
                });

                const payload = {
                    username: foundUser[0].username,
                    refreshToken: refresh
                };
                const token = this.jwtService.sign(payload);

                if (!udpated) throw Error("Something went  wrong");

                return {
                    username: username,
                    token: token,
                    refreshtoken: refresh
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

            return {
                message: "Sucessgfully registered"
            };
        }
    }
}
