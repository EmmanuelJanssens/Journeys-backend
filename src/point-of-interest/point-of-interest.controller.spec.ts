import { Test, TestingModule } from "@nestjs/testing";
import { PointOfInterestController } from "./point-of-interest.controller";
import { PointOfInterestService } from "./point-of-interest.service";

describe("PointOfInterestController", () => {
    let controller: PointOfInterestController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PointOfInterestController],
            providers: [PointOfInterestService]
        }).compile();

        controller = module.get<PointOfInterestController>(
            PointOfInterestController
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
