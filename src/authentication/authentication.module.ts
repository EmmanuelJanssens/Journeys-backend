import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthenticationService } from "./authentication.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";

@Module({
    imports: [
        UserModule,
        PassportModule.register({ session: true }),
        JwtModule.register({
            secret: "12345",
            signOptions: { expiresIn: "64000s" }
        })
    ],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}
