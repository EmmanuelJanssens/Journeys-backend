import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseService } from "firebase/firebase.service";
import { FirebaseAuthGuard } from "guard/firebase-auth.guard";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
    let controller: UserController;

    const mockUserService = {};
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService, FirebaseService, FirebaseAuthGuard]
        })
            .overrideProvider(UserService)
            .useValue(mockUserService)
            .overrideGuard(FirebaseAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideProvider(FirebaseService)
            .useValue({})
            .compile();

        controller = module.get<UserController>(UserController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
