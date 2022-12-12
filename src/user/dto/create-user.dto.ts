import { PartialType } from "@nestjs/swagger";
import { User } from "user/entities/user.entity";

export class CreateUserDto extends PartialType(User) {}
