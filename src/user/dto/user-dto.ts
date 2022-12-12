import { PartialType } from "@nestjs/swagger";
import { User } from "user/entities/user.entity";

export class UserDto extends PartialType(User) {}
