import { Test, TestingModule } from "@nestjs/testing";
import { JourneyController } from "./journey.controller";
import { JourneyService } from "./journey.service";

describe("JourneyController", () => {
    let controller: JourneyController;
    const mockJourneyService = {};
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JourneyController],
            providers: [JourneyService]
        })
            .overrideProvider(JourneyService)
            .useValue(mockJourneyService)
            .compile();

        controller = module.get<JourneyController>(JourneyController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
