import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseService } from "../firebase/firebase.service";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageController } from "./image.controller";
import { ImageRepository } from "./image.repository";
import { ImageService } from "./image.service";

describe("ImageController", () => {
    let controller: ImageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
            providers: [
                ImageService,
                ImageRepository,
                Neo4jService,
                FirebaseService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue({})
            .overrideProvider(FirebaseService)
            .useValue({})
            .compile();

        controller = module.get<ImageController>(ImageController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
