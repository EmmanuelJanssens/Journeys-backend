import { PartialType } from "@nestjs/swagger";
import { User } from "src/model/User";

export class RegisterUserDo extends PartialType(User) {}
