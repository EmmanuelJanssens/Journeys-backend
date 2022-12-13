import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from "@nestjs/common";
import { TagService } from "./tag.service";

@Controller("tag")
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    async findAll(): Promise<any> {
        return this.tagService.findAll();
    }

    @Get(":tags")
    async findWithPois(@Param("tags") tags: string): Promise<any> {
        return this.tagService.findWithPois(tags.split(","));
    }
}
