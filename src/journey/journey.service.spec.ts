import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jModule } from "neo4j/neo4j.module";
import { Neo4jService } from "neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";
import { PointToLocation } from "entities/utilities";
import { JourneyNode } from "./entities/journey.entity";
import { Integer, Node, Point } from "neo4j-driver-core";
import { int, QueryResult } from "neo4j-driver";
import { JourneyDto } from "./dto/journey.dto";
describe("JourneyService", () => {
    let service: JourneyService;
    let neo4jService: Neo4jService;
    let repository: JourneyRepository;
    let testingModule: TestingModule;

    const mockNeo4jService = {};

    //mock entire neo4j driver
    jest.mock("neo4j-driver/lib/driver");
    const mockRepository = {};
    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            providers: [JourneyService, Neo4jService, JourneyRepository]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .compile();

        service = await testingModule.resolve(JourneyService);
        repository = await testingModule.get(JourneyRepository);
        neo4jService = await testingModule.get(Neo4jService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("::findOne", () => {
        it("should find one", async () => {
            const expected: JourneyDto = {
                id: "test-id",
                title: "title",
                description: "description",
                start: {
                    latitude: 0,
                    longitude: 0
                },
                end: {
                    latitude: 0,
                    longitude: 0
                },
                creator: "test-user",
                experiencesAggregate: {
                    count: 10
                },
                visibility: "public"
            };
            jest.spyOn(repository, "get").mockResolvedValueOnce(<QueryResult>{
                records: [
                    {
                        keys: ["journey"],
                        get: (key) => {
                            switch (key) {
                                case "journey":
                                    return new Node(int(1), ["Journey"], {
                                        id: expected.id,
                                        title: expected.title,
                                        description: expected.description,
                                        start: new Point(4326, 0, 0),
                                        end: new Point(4326, 0, 0),
                                        visibility: expected.visibility
                                    });
                                case "creator":
                                    return "test-user";
                                case "count":
                                    return 10;
                            }
                        }
                    }
                ]
            });
            const result = await service.findOne("journeyid");

            expect(result).toStrictEqual(expected);
        });

        it("should find one with missing description", async () => {
            const expected: JourneyDto = {
                id: "test-id",
                title: "title",
                start: {
                    latitude: 0,
                    longitude: 0
                },
                end: {
                    latitude: 0,
                    longitude: 0
                },
                creator: "test-user",
                experiencesAggregate: {
                    count: 10
                },
                visibility: "public"
            };
            jest.spyOn(repository, "get").mockResolvedValueOnce(<QueryResult>{
                records: [
                    {
                        keys: ["journey"],
                        get: (key) => {
                            switch (key) {
                                case "journey":
                                    return new Node(int(1), ["Journey"], {
                                        id: expected.id,
                                        title: expected.title,
                                        start: new Point(4326, 0, 0),
                                        end: new Point(4326, 0, 0),
                                        visibility: expected.visibility
                                    });
                                case "creator":
                                    return "test-user";
                                case "count":
                                    return 10;
                            }
                        }
                    }
                ]
            });
            const result = await service.findOne("journeyid");

            expect(result).toStrictEqual(expected);
        });
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
