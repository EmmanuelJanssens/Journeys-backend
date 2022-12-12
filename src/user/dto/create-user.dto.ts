import { PartialType, PickType } from "@nestjs/swagger";
import { User } from "user/entities/user.entity";
import { UserDto } from "./user-dto";

export class CreateUserDto extends PickType(UserDto, [
    "firstname",
    "lastname",
    "username",
    "visibility"
]) {}
