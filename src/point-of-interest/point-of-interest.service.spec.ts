import { Test, TestingModule } from "@nestjs/testing";
import { PointOfInterestService } from "./point-of-interest.service";

describe("PointOfInterestService", () => {
    let service: PointOfInterestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointOfInterestService]
        }).compile();

        service = module.get<PointOfInterestService>(PointOfInterestService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
