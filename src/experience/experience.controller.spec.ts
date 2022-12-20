import { Test, TestingModule } from "@nestjs/testing";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";
import { FirebaseService } from "../firebase/firebase.service";
import { FirebaseAuthGuard } from "../guard/firebase-auth.guard";
import { ExperienceController } from "./experience.controller";
import { ExperienceService } from "./experience.service";

describe("ExperienceController", () => {
    let controller: ExperienceController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExperienceController],
            providers: [
                ExperienceService,
                ErrorsInterceptor,
                FirebaseAuthGuard,
                FirebaseService
            ]
        })
            .overrideProvider(ExperienceService)
            .useValue({})
            .overrideGuard(FirebaseAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideProvider(FirebaseService)
            .useValue({})
            .compile();

        controller = module.get<ExperienceController>(ExperienceController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
