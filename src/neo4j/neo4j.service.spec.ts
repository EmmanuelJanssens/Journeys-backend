import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "./neo4j.service";
import { Neo4jModule } from "./neo4j.module";

describe("Neo4jService", () => {
    let service: Neo4jService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [Neo4jService]
        })
            .overrideProvider(Neo4jService)
            .useValue({})
            .compile();

        service = module.get<Neo4jService>(Neo4jService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
