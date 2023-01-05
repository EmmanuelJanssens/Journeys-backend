import { PickType } from "@nestjs/mapped-types";
import { Image } from "../entities/image.entity";

export class ImageDto extends PickType(Image, ["id", "url", "thumbnail"]) {}
