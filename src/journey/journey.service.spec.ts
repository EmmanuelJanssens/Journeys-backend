import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";
import { Point, Integer, Record } from "neo4j-driver";
import { ExperienceService } from "../experience/experience.service";
import { JourneyRepositoryMock } from "./mock/journey.repository.mock";
import { Locality } from "src/utilities/Locality";
import { CreateExperienceDto } from "src/experience/dto/create-experience.dto";
import { Node } from "neo4j-driver";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";
import { Experience } from "src/experience/entities/experience.entity";
describe("JourneyService", () => {
    let service: JourneyService;
    let testingModule: TestingModule;

    const mockNeo4jService = {};
    const mockExpService = {
        createMany: jest
            .fn()
            .mockImplementation(
                (
                    userId: string,
                    journeyId: string,
                    experiences: CreateExperienceDto[]
                ): Promise<any> => {
                    const resp: {
                        experience: Experience;
                        poi: PointOfInterest;
                    }[] = experiences.map((created) => {
                        return {
                            experience: <Experience>{
                                title: created.title,
                                description: created.description,
                                id: "test-id",
                                images: created.images
                            },
                            poi: <PointOfInterest>{
                                id: "test-id",
                                name: "test-name",
                                location: new Point(new Integer(1000), 0, 0)
                            }
                        };
                    });
                    return Promise.resolve(resp);
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
                ExperienceService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .overrideProvider(ExperienceService)
            .useValue(mockExpService)
            .overrideProvider(JourneyRepository)
            .useClass(JourneyRepositoryMock)
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
                thumbnails: [["thumbnail"], []]
            };
            const res = await service.findOne("test-id");
            expect(res).toEqual(expected);
        });
    });

    describe("::create", () => {
        it("should return the created journey with additional metadata(creator,experiencesCount, thumbnails)", async () => {
            const res = await service.create("test-user", {
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

            expect(res.journey).toBeDefined();
            expect(res.journey).toEqual({
                id: "created-journey-id",
                title: "title",
                description: "description",
                start: new Point(new Integer(4326), 0, 0),
                end: new Point(new Integer(4326), 0, 0),
                visibility: "public"
            });
            expect(res.creator).toEqual("test-user");
            expect(res.experiences.length).toEqual(0);
        });

        it("should return the created journey with added experiences and additional metadata(creator,experiencesCount, thumbnails)", async () => {
            const res = await service.create("test-user", {
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
                        images: ["img", "img2"],
                        date: "2021-01-01",
                        poi: "poi-id"
                    },
                    {
                        title: "title2",
                        description: "description2",
                        images: ["img", "img2"],
                        date: "2021-01-01",
                        poi: "poi-id2"
                    }
                ]
            });
            expect(res.journey).toBeDefined();
            expect(res.journey).toEqual({
                id: "created-journey-id",
                title: "title",
                description: "description",
                start: new Point(new Integer(4326), 0, 0),
                end: new Point(new Integer(4326), 0, 0),
                visibility: "public"
            });
            expect(res.creator).toEqual("test-user");
            expect(res.experiences.length).toEqual(2);
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
