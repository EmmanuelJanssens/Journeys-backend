import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthenticationService } from "./authentication.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [".env.local"]
        }),
        UserModule,
        PassportModule.register({ session: true }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_TOKEN_DURATION,
                algorithm: "RS256"
            }
        })
    ],
    providers: [AuthenticationService],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}
