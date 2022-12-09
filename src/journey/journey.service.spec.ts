import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyController } from "./journey.controller";
import { JourneyService } from "./journey.service";

describe("JourneyService", () => {
    let service: JourneyService;
    let controller: JourneyController;
    let neo4jService: Neo4jService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JourneyService]
        }).compile();

        service = module.get<JourneyService>(JourneyService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
