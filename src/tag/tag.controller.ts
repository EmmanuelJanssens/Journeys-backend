import { Controller, Get, Param, Query } from "@nestjs/common";

import { TagService } from "./tag.service";

@Controller("tag")
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    async getAll() {
        const result = await this.tagService.getAll();
        return result;
    }

    @Get("/pois")
    async getFor(@Query("tags") tag: string) {
        if (tag) {
            const tags = tag.split(",");
            const result = await this.tagService.getPoiFor(tags);
            return result;
        } else return [];
    }
}
