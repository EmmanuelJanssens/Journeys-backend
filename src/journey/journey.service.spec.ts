import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jModule } from "neo4j/neo4j.module";
import { Neo4jService } from "neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";

describe("JourneyService", () => {
    let service: JourneyService;
    let neo4jService: Neo4jService;
    let testingModule: TestingModule;

    const mockNeo4jService = {};

    //mock entire neo4j driver
    jest.mock("neo4j-driver/lib/driver");
    const mockRepository = {};
    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            providers: [JourneyService, Neo4jService, JourneyRepository]
        })
            .overrideProvider(JourneyRepository)
            .useValue(mockRepository)
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .compile();

        service = await testingModule.resolve<JourneyService>(JourneyService);
        neo4jService = await testingModule.resolve<Neo4jService>(Neo4jService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should create one ::create", async () => {
        //
    });

    it("should add an experience ::addExperience", async () => {
        //
    });

    it("should add an array of experiences ::addExperiences", async () => {
        //
    });

    describe("It should update the fields of a journey ::update", () => {
        //
    });
    it("should update the description fields of the journey ", async () => {
        //
    });
    it("should update the title fields of the journey", async () => {
        //
    });
    it("should update the thumbnail fields of the journey ", async () => {
        //
    });
    it("should update the visibility fields of the journey", async () => {
        //
    });
});
