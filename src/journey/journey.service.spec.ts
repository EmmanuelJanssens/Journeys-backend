import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";
import { int, QueryResult, Node, Point, Integer } from "neo4j-driver";
import { ExperienceService } from "../experience/experience.service";
describe("JourneyService", () => {
    let service: JourneyService;
    let repository: JourneyRepository;
    let testingModule: TestingModule;

    const mockNeo4jService = {};

    const mockRepository = {};
    //mock entire neo4j driver
    jest.mock("neo4j-driver/lib/driver");
    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            providers: [
                JourneyService,
                Neo4jService,
                JourneyRepository,
                ExperienceService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .overrideProvider(ExperienceService)
            .useValue({})
            .compile();

        service = await testingModule.resolve(JourneyService);
        repository = await testingModule.get(JourneyRepository);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("::findOne", () => {
        it("should find one", async () => {
            const expected = {
                journey: {
                    id: "test-id",
                    title: "title",
                    description: "description",
                    start: new Point(new Integer(4326), 0, 0),
                    end: new Point(new Integer(4326), 0, 0),
                    visibility: "public"
                },
                creator: "test-user",
                experiencesCount: 10,
                thumbnails: [["thumbnail"], []]
            };
            jest.spyOn(repository, "get").mockResolvedValueOnce(<QueryResult>{
                records: [
                    {
                        keys: ["journey"],
                        get: (key) => {
                            switch (key) {
                                case "journey":
                                    return new Node(int(1), ["Journey"], {
                                        id: expected.journey.id,
                                        title: expected.journey.title,
                                        description: "description",
                                        start: new Point(
                                            new Integer(4326),
                                            0,
                                            0
                                        ),
                                        end: new Point(new Integer(4326), 0, 0),
                                        visibility: expected.journey.visibility
                                    });
                                case "thumbnails":
                                    return [["thumbnail"], []];
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
            const expected = {
                journey: {
                    id: "test-id",
                    title: "title",
                    start: new Point(new Integer(4326), 0, 0),
                    end: new Point(new Integer(4326), 0, 0),
                    visibility: "public"
                },
                creator: "test-user",
                experiencesCount: 10,
                thumbnails: [["thumbnail"], []]
            };
            jest.spyOn(repository, "get").mockResolvedValueOnce(<QueryResult>{
                records: [
                    {
                        keys: ["journey"],
                        get: (key) => {
                            switch (key) {
                                case "journey":
                                    return new Node(int(1), ["Journey"], {
                                        id: expected.journey.id,
                                        title: expected.journey.title,
                                        start: new Point(
                                            new Integer(4326),
                                            0,
                                            0
                                        ),
                                        end: new Point(new Integer(4326), 0, 0),
                                        visibility: expected.journey.visibility
                                    });
                                case "thumbnails":
                                    return [["thumbnail"], []];
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
