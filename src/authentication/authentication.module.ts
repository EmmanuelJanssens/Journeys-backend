import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthenticationService } from "./authentication.service";
import { LocalStrategy } from "./local.strategy";
import { SessionSerializer } from "./session.serializer";

@Module({
    imports: [UserModule, PassportModule.register({ session: true })],
    providers: [AuthenticationService, LocalStrategy, SessionSerializer],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}
