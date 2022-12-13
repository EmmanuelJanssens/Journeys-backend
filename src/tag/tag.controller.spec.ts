import { Test, TestingModule } from "@nestjs/testing";
import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";

describe("TagController", () => {
    let controller: TagController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TagController],
            providers: [TagService]
        })
            .overrideProvider(TagService)
            .useValue({})
            .compile();

        controller = module.get<TagController>(TagController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
