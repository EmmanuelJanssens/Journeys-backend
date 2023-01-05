import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageRepository } from "../image/image.repository";
import { ExperienceRepository } from "./experience.repository";
import { ExperienceService } from "./experience.service";
import { ExperienceRepositoryMock } from "./mock/experience.repository.mock";
import { Record, Node, Integer } from "neo4j-driver";
import { create } from "domain";

describe("ExperienceService", () => {
    let service: ExperienceService;
    const mockNeo4jService = {
        getWriteSession: jest.fn().mockImplementation(() => {
            const executeWrite = {
                executeWrite: jest.fn().mockImplementation((tx) => {
                    tx();
                }),
                close: jest.fn()
            };
            return executeWrite;
        })
    };

    const mockImageRepository = {
        createAndConnectImageToExperience: jest
            .fn()
            .mockImplementation(
                (tx, experienceId: string, imageFiles: string[]) => {
                    const records = imageFiles.map((file) => {
                        const record = new Record(
                            ["images"],
                            [
                                new Node(new Integer(1), ["Image"], {
                                    id: "test-image-id",
                                    url: file,
                                    thumbnail: file
                                })
                            ],
                            {
                                image: 0
                            }
                        );
                        return record;
                    });

                    return new Promise((resolve) => resolve({ records }));
                }
            )
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExperienceService,
                ExperienceRepository,
                ImageRepository,
                Neo4jService
            ]
        })
            .overrideProvider(Neo4jService)
            .useValue(mockNeo4jService)
            .overrideProvider(ExperienceRepository)
            .useClass(ExperienceRepositoryMock)
            .overrideProvider(ImageRepository)
            .useValue(mockImageRepository)
            .compile();

        service = module.get<ExperienceService>(ExperienceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("::create", () => {
        it("should return an experience, its images and its point of interest", async () => {
            const exps = [
                {
                    title: "test-title",
                    description: "test-description",
                    date: "2022-01-01",
                    addedImages: ["img1", "img2", "img3"],
                    poi: "test-poi-id"
                },
                {
                    title: "test-title",
                    description: "test-description",
                    date: "2022-01-01",
                    addedImages: ["img1", "img2"],
                    poi: "test-poi-id2"
                }
            ];
            const result = await service.create(
                "",
                "test-user",
                "test-journey",
                exps
            );
            expect(result.length).toBe(2);
            expect(result[0].experience.title).toBe("test-title");
            expect(result[0].experience.date).toBe("2022-01-01");
            expect(result[0].experience.description).toBe("test-description");
            expect(result[0].images.length).toBe(3);
            expect(result[0].poi.id).toBe("test-poi-id");
        });
    });
});
