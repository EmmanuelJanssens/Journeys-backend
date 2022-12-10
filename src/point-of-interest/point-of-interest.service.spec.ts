import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "neo4j/neo4j.service";
import { PointOfInterestService } from "./point-of-interest.service";

describe("PointOfInterestService", () => {
    let service: PointOfInterestService;
    const mockNeo4jService = {};
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointOfInterestService, Neo4jService]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .compile();

        service = module.get<PointOfInterestService>(PointOfInterestService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
