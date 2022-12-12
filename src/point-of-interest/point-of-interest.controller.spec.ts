import { Test, TestingModule } from "@nestjs/testing";
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
            providers: [PointOfInterestService]
        })
            .overrideProvider(PointOfInterestService)
            .useValue(mockPOIService)
            .compile();

        controller = module.get<PointOfInterestController>(
            PointOfInterestController
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
