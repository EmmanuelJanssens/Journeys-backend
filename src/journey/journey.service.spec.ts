import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";
import { ExperienceService } from "../experience/experience.service";
import { JourneyRepositoryMock } from "./mock/journey.repository.mock";
import { Locality } from "../utilities/Locality";
import { ImageRepository } from "../image/image.repository";
import { BatchUpdateExperienceDto } from "../experience/dto/batch-update-experience.dto";
import { Integer, Point } from "neo4j-driver";

import { Experience } from "../experience/entities/experience.entity";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { ExperienceRepository } from "../experience/experience.repository";

describe("JourneyService", () => {
    let service: JourneyService;
    let testingModule: TestingModule;

    const mockNeo4jService = {};
    const mockExpService = {
        batchUpdate: jest
            .fn()
            .mockImplementation(
                (
                    userId: string,
                    journeyId: string,
                    batch: BatchUpdateExperienceDto
                ) => {
                    const exps = batch.connected;
                    const resp: {
                        experience: Experience;
                        poi: PointOfInterest;
                    }[] = exps.map((created) => {
                        return {
                            experience: {
                                title: created.title,
                                date: new Date(created.date),
                                description: created.description,
                                id: "test-id",
                                images: created.addedImages
                            },
                            poi: <PointOfInterest>(<unknown>{
                                id: "test-id",
                                name: "test-name",
                                location: new Point(new Integer(1000), 0, 0),
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })
                        };
                    });
                    return Promise.resolve({ created: resp });
                }
            )
    };
    //mock entire neo4j driver
    jest.mock("neo4j-driver/lib/driver");
    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            providers: [
                JourneyService,
                Neo4jService,
                JourneyRepository,
                ImageRepository,
                ExperienceService,
                ExperienceRepository
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .overrideProvider(ExperienceService)
            .useValue(mockExpService)
            .overrideProvider(JourneyRepository)
            .useClass(JourneyRepositoryMock)
            .overrideProvider(ExperienceRepository)
            .useValue({})
            .compile();

        service = await testingModule.resolve(JourneyService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("::findOne", () => {
        it("should return a journey with additional metadata (creator,experiencesCount, thumbnails)", async () => {
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
                thumbnail: "thumbnail",
                thumbnails: [["thumbnail"], []]
            };
            const res = await service.findOne("test-id");
            expect(res).toEqual(expected);
        });
    });

    describe("::create", () => {
        it("should return the created journey with additional metadata(creator,experiencesCount, thumbnails)", async () => {
            const res = await service.createOne("test-user", {
                visibility: "public",
                title: "title",
                description: "description",
                start: <Locality>{
                    latitude: 0,
                    longitude: 0
                },
                end: <Locality>{
                    latitude: 0,
                    longitude: 0
                },
                experiences: []
            });

            expect(res.createdJourney).toBeDefined();
            expect(res.createdJourney).toEqual({
                id: "created-journey-id",
                title: "title",
                description: "description",
                start: new Point(new Integer(4326), 0, 0),
                end: new Point(new Integer(4326), 0, 0),
                visibility: "public"
            });
            expect(res.creator).toEqual("test-user");
            expect(res.createdExperiences.length).toEqual(0);
        });

        it("should return the created journey with added experiences and additional metadata(creator,experiencesCount, thumbnails)", async () => {
            const res = await service.createOne("test-user", {
                visibility: "public",
                title: "title",
                description: "description",
                start: <Locality>{
                    latitude: 0,
                    longitude: 0
                },
                end: <Locality>{
                    latitude: 0,
                    longitude: 0
                },
                experiences: [
                    {
                        title: "title",
                        description: "description",
                        date: new Date("2021-01-01"),
                        poi: "poi-id"
                    },
                    {
                        title: "title2",
                        description: "description2",
                        date: new Date("2021-01-01"),
                        poi: "poi-id2"
                    }
                ]
            });
            expect(res.createdJourney).toBeDefined();
            expect(res.createdJourney).toEqual({
                id: "created-journey-id",
                title: "title",
                description: "description",
                start: new Point(new Integer(4326), 0, 0),
                end: new Point(new Integer(4326), 0, 0),
                visibility: "public"
            });
            expect(res.creator).toEqual("test-user");
            expect(res.createdExperiences.length).toEqual(2);
        });
    });

    it("should add an experience ::addExperience", async () => {
        //
    });

    it("should add an array of experiences ::addExperiences", async () => {
        //
    });

    describe("::update", () => {
        it("should update multiple fields of a journey", async () => {
            const res = await service.update("test-user", "journey-id", {
                id: "test-id",
                title: "new-title",
                description: "new-description"
            });
            expect(res.journey.title).toEqual("new-title");
            expect(res.journey.description).toEqual("new-description");
            expect(res.journey.visibility).toEqual("public");
        });
        it("should update the description fields of the journey ", async () => {
            const res = await service.update("test-user", "journey-id", {
                id: "test-id",
                description: "new-description"
            });
            expect(res.journey.title).toEqual("title");
            expect(res.journey.description).toEqual("new-description");
        });
        it("should update the title fields of the journey", async () => {
            const res = await service.update("test-user", "journey-id", {
                id: "test-id",
                title: "new-title"
            });
            expect(res.journey.description).toEqual("description");
            expect(res.journey.title).toEqual("new-title");
        });

        it("should update the visibility fields of the journey", async () => {
            const res = await service.update("test-user", "journey-id", {
                id: "test-id",
                visibility: "private"
            });
            expect(res.journey.description).toEqual("description");
            expect(res.journey.visibility).toEqual("private");
        });
    });
});
