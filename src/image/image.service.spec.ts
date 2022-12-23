import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageRepository } from "./image.repository";
import { ImageService } from "./image.service";

describe("ImageService", () => {
    let service: ImageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService, ImageRepository, Neo4jService]
        })
            .overrideProvider(Neo4jService)
            .useValue({})
            .compile();

        service = module.get<ImageService>(ImageService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
