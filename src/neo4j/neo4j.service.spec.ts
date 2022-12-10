import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "./neo4j.service";
import { NEO4J_CONFIG, NEO4J_DRIVER } from "./neo4j.constants";
import { Neo4jModule } from "./neo4j.module";

describe("Neo4jService", () => {
    let service: Neo4jService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                Neo4jModule.forRoot({
                    host: process.env.NEO4J_HOST,
                    password: process.env.NEO4J_PWD,
                    scheme: process.env.NEO4J_SCHEME,
                    port: process.env.NEO4J_PORT,
                    username: process.env.NEO4j_USER
                })
            ],
            providers: [Neo4jService]
        }).compile();

        service = await module.resolve<Neo4jService>(Neo4jService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
