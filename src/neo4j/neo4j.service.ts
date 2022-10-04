import { Neo4jGraphQL } from "@neo4j/graphql";
import { Model, OGM } from "@neo4j/graphql-ogm";
import { Inject, Injectable } from "@nestjs/common";
import { DocumentNode } from "graphql";
import { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j-config.interface";
import { NEO4J_CONFIG, NEO4J_DRIVER } from "./neo4j.constants";
import { AppConfig } from "./neo4j.utils";

@Injectable()
export class Neo4jService {
    constructor(
        @Inject(NEO4J_CONFIG) private config: Neo4jConfig,
        @Inject(NEO4J_DRIVER) private readonly gql: AppConfig
    ) {}

    getConfig(): Neo4jConfig {
        return this.config;
    }

    getDriver(): Driver {
        return this.gql.driver;
    }

    getOGM(): OGM {
        return this.gql.ogm;
    }

    getSchema(): Neo4jGraphQL {
        return this.gql.schema;
    }

    getModel(model: string): Model {
        return this.gql.ogm.model(model);
    }

    async readGql<T>(
        model: Model,
        selectionSet: DocumentNode,
        where: any,
        options?: any | undefined
    ) {
        const result: T = await model.find({
            selectionSet,
            where,
            options
        });

        return result;
    }

    async createGql<T>(model: Model, input: T) {
        const created = await model.create({
            input: [input]
        });
        return created;
    }

    async updateGql<T>(model: Model, id: string, data: T) {
        const updated = await model.update({
            where: { id: id },
            update: data
        });
        return updated;
    }
}
