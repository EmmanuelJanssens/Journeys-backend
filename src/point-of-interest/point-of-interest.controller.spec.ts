import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseService } from "../firebase/firebase.service";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { Neo4jService } from "../neo4j/neo4j.service";
import { PointOfInterestController } from "./point-of-interest.controller";
import { PoiRepository } from "./point-of-interest.repository";
import { PointOfInterestService } from "./point-of-interest.service";

describe("PointOfInterestController", () => {
    let controller: PointOfInterestController;

    const mockPOIService = {};
    const mockPoiRepository = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PointOfInterestController],
            providers: [
                PointOfInterestService,
                PoiRepository,
                FirebaseService,
                FirebaseAuthGuard,
                Neo4jService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue({})
            .overrideProvider(PointOfInterestService)
            .useValue(mockPOIService)
            .overrideGuard(FirebaseAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideProvider(FirebaseService)
            .useValue({})
            .compile();

        controller = module.get<PointOfInterestController>(
            PointOfInterestController
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
