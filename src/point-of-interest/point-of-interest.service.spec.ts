import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseService } from "firebase/firebase.service";
import { FirebaseAuthGuard } from "guard/firebase-auth.guard";
import { Neo4jService } from "neo4j/neo4j.service";
import { PoiRepository } from "./point-of-interest.repository";
import { PointOfInterestService } from "./point-of-interest.service";

describe("PointOfInterestService", () => {
    let service: PointOfInterestService;
    const mockNeo4jService = {};
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointOfInterestService, PoiRepository, Neo4jService]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .overrideProvider(PoiRepository)
            .useValue({})
            .compile();

        service = module.get<PointOfInterestService>(PointOfInterestService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
