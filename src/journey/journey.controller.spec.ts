import { Test, TestingModule } from "@nestjs/testing";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";
import { JourneyController } from "./journey.controller";
import { JourneyService } from "./journey.service";

describe("JourneyController", () => {
    let controller: JourneyController;

    const mockJourneyService = {
        findOne: jest.fn().mockImplementation((id) => {
            return {
                id: id,
                description: "helloworld",
                title: "test",
                visibility: "private",
                end: {
                    latitude: 0,
                    longitude: 0
                },
                start: {
                    latitude: 0,
                    longitude: 0
                },
                experiences: []
            };
        })
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JourneyController],
            providers: [JourneyService, ErrorsInterceptor]
        })
            .overrideProvider(JourneyService)
            .useValue(mockJourneyService)
            .compile();
        controller = module.get<JourneyController>(JourneyController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    it("should return correct id", async () => {
        const dto = {
            id: "journeyid",
            description: "helloworld",
            title: "test",
            visibility: "private",
            end: {
                latitude: 0,
                longitude: 0
            },
            start: {
                latitude: 0,
                longitude: 0
            },
            experiences: []
        };

        // const ctx = createMock<ApplicationContext>();
        const result = await controller.findOne("journeyid");
        expect(result.id).toEqual(dto.id);
    });
});
