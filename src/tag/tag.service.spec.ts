import { Test, TestingModule } from "@nestjs/testing";
import { TagRepository } from "./tag.repository";
import { TagService } from "./tag.service";

describe("TagService", () => {
    let service: TagService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TagService, TagRepository]
        })
            .overrideProvider(TagRepository)
            .useValue({})
            .compile();

        service = module.get<TagService>(TagService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
