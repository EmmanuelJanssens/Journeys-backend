import { Test, TestingModule } from "@nestjs/testing";
import { ExperienceRepository } from "./experience.repository";
import { ExperienceService } from "./experience.service";

describe("ExperienceService", () => {
    let service: ExperienceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExperienceService, ExperienceRepository]
        })
            .overrideProvider(ExperienceRepository)
            .useValue({})
            .compile();

        service = module.get<ExperienceService>(ExperienceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
