import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseService } from "./firebase.service";

describe("FirebaseService", () => {
    let service: FirebaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FirebaseService]
        })
            .overrideProvider(FirebaseService)
            .useValue({})
            .compile();

        service = module.get<FirebaseService>(FirebaseService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
