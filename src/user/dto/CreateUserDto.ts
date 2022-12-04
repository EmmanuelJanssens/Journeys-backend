import { PartialType } from "@nestjs/swagger";
import { User } from "src/model/User";

export class CreateUserDto extends PartialType(User) {}
