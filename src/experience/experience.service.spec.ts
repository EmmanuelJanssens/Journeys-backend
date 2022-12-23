import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageRepository } from "../image/image.repository";
import { ExperienceRepository } from "./experience.repository";
import { ExperienceService } from "./experience.service";

describe("ExperienceService", () => {
    let service: ExperienceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExperienceService,
                ExperienceRepository,
                ImageRepository,
                Neo4jService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue({})
            .overrideProvider(ExperienceRepository)
            .useValue({})
            .compile();

        service = module.get<ExperienceService>(ExperienceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
