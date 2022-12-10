import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jModule } from "neo4j/neo4j.module";
import { Neo4jService } from "neo4j/neo4j.service";
import { JourneyService } from "./journey.service";
import { JourneyRepository } from "./journey.repository";

describe("JourneyService", () => {
    let service: JourneyService;
    let neo4jService: Neo4jService;
    let testingModule: TestingModule;

    const mockRepository = {
        create: jest.fn().mockImplementation((user, dto) => {
            return {
                id: "journeyid",
                creator: user,
                ...dto
            };
        }),
        addExperience: jest
            .fn()
            .mockImplementation((user, journey, poi, dto) => {
                return dto;
            }),
        addExperiences: jest.fn().mockImplementation((journey, experiences) => {
            const data = [];
            experiences.forEach((exp) => {
                data.push(exp.experience);
            });
            return {
                id: journey,
                description: "helloworld",
                title: "test",
                visibility: "private",
                end: {
                    x: 0,
                    y: 0
                },
                start: {
                    x: 0,
                    y: 0
                },
                experiences: data
            };
        }),
        update: jest.fn().mockImplementation((user, journey) => {
            return {
                id: "journeyid",
                end: {
                    x: 0,
                    y: 0
                },
                start: {
                    x: 0,
                    y: 0
                },
                ...journey
            };
        }),
        get: jest.fn().mockImplementation((journey) => {
            return {
                id: journey,
                end: {
                    x: 0,
                    y: 0
                },
                start: {
                    x: 0,
                    y: 0
                }
            };
        })
    };
    //mock entire neo4j driver
    jest.mock("neo4j-driver/lib/driver");

    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            imports: [
                Neo4jModule.forRoot({
                    host: "localhost",
                    password: "password",
                    scheme: "neo4j",
                    port: 7687,
                    username: "neo4j"
                })
            ],
            providers: [JourneyService, Neo4jService, JourneyRepository]
        })
            .overrideProvider(JourneyRepository)
            .useValue(mockRepository)
            .compile();

        service = await testingModule.resolve<JourneyService>(JourneyService);
        neo4jService = await testingModule.resolve<Neo4jService>(Neo4jService);
    });

    afterAll(() => {
        neo4jService.getDriver().close();
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(service.getRepository()).toBeDefined();
    });

    it("should transform position ::transformPos", () => {
        const data: any = {
            id: "journeyid",
            description: "helloworld",
            title: "test",
            visibility: "private",
            end: {
                x: 0,
                y: 0
            },
            start: {
                x: 0,
                y: 0
            },
            experiences: []
        };

        const result = service.transformPos(data);
        expect(result.start).toStrictEqual({
            latitude: 0,
            longitude: 0
        });
        expect(result.end).toStrictEqual({
            latitude: 0,
            longitude: 0
        });
    });

    it("should create one ::create", async () => {
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();

        const data: any = {
            description: "helloworld",
            title: "test",
            visibility: "private",
            end: {
                x: 0,
                y: 0
            },
            start: {
                x: 0,
                y: 0
            },
            experiences: []
        };

        const result = await service.create("user", data);
        expect(result.id).toBeDefined();
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.description).toStrictEqual(data.description);
        expect(result.title).toStrictEqual(data.title);
        expect(result.start).toStrictEqual({
            latitude: 0,
            longitude: 0
        });
        expect(result.end).toStrictEqual({
            latitude: 0,
            longitude: 0
        });
        expect(result.creator).toStrictEqual("user");
    });

    it("should add an experience ::addExperience", async () => {
        const date = new Date();
        const dto = {
            date: date,
            description: "description",
            images: ["img1", "img2"],
            title: "title"
        };
        const result = await service.addExperience(
            "user",
            "idCreated",
            "poiid",
            dto
        );

        expect(result).toEqual(dto);
    });

    it("should add an array of experiences ::addExperiences", async () => {
        const date = new Date();
        const dto = [
            {
                experience: {
                    date: date,
                    description: "description2",
                    images: ["img3", "img4"],
                    title: "title2"
                },
                poi: {
                    id: "id"
                }
            },
            {
                experience: {
                    date: date,
                    description: "description",
                    images: ["img1", "img2"],
                    title: "title"
                },
                poi: {
                    id: "id2"
                }
            }
        ];
        const result = await service.addExperiences("journeyid", dto);
        expect(result.experiences.length).toStrictEqual(2);
    });

    describe("It should update the fields of a journey ::update", () => {
        it("should update all the fields of the journey ", async () => {
            const dto = {
                id: "update",
                title: "title",
                description: "description",
                thumbnail: "thumbnail",
                visibility: "public"
            };

            const result = await service.update("user", dto as any);

            expect(result).toStrictEqual({
                end: {
                    latitude: 0,
                    longitude: 0
                },
                start: {
                    latitude: 0,
                    longitude: 0
                },
                ...dto
            });
        });
        it("should update the description fields of the journey ", async () => {
            const dto = {
                id: "update",
                description: "empty"
            };

            const result = await service.update("user", dto as any);

            expect(result.description).toStrictEqual(dto.description);
            expect(result.id).toStrictEqual(dto.id);
        });
        it("should update the title fields of the journey", async () => {
            const dto = {
                id: "update",
                title: "title"
            };

            const result = await service.update("user", dto as any);

            expect(result.title).toStrictEqual(dto.title);
            expect(result.id).toStrictEqual(dto.id);
        });
        it("should update the thumbnail fields of the journey ", async () => {
            const dto = {
                id: "update",
                thumbnail: "img.png"
            };

            const result = await service.update("user", dto as any);

            expect(result.thumbnail).toStrictEqual(dto.thumbnail);
            expect(result.id).toStrictEqual(dto.id);
        });
        it("should update the visibility fields of the journey", async () => {
            const dto = {
                id: "update",
                visibility: "private"
            };

            const result = await service.update("user", dto as any);

            expect(result.visibility).toStrictEqual(dto.visibility);
            expect(result.id).toStrictEqual(dto.id);
        });
    });
});
