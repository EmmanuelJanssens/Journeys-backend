import { Inject, Injectable } from "@nestjs/common";
import {
    Driver,
    QueryResult,
    Result,
    session,
    Session,
    Transaction
} from "neo4j-driver";
import { Neo4jConfig } from "./neo4j-config.interface";
import { NEO4J_CONFIG, NEO4J_DRIVER } from "./neo4j.constants";

@Injectable()
export class Neo4jService {
    constructor(
        @Inject(NEO4J_CONFIG) private config: Neo4jConfig,
        @Inject(NEO4J_DRIVER) private readonly driver: Driver
    ) {}

    getDriver(): Driver {
        return this.driver;
    }
    getConfig(): Neo4jConfig {
        return this.config;
    }

    getReadSession(database?: string): Session {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: session.READ
        });
    }

    getWriteSession(database?: string): Session {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: session.WRITE
        });
    }

    read(
        cypher: string,
        params: Record<string, any>,
        database?: string
    ): Promise<QueryResult | void> {
        const session = this.getReadSession(database);
        return session
            .run(cypher, params)
            .catch(() => {
                session.close();
                throw new Error("could not read from session");
            })
            .finally(() => session.close());
    }

    write(
        cypher: string,
        params: Record<string, any>,
        database?: string
    ): Promise<QueryResult | void> {
        const session = this.getWriteSession(database);

        return session
            .run(cypher, params)
            .catch((e) => {
                session.close();
                throw new Error("could not write to session");
            })
            .finally(() => session.close());
    }

    // getDriver(): Driver {
    //     return this.gql.driver;
    // }

    // getOGM(): OGM {
    //     return this.gql.ogm;
    // }

    // getSchema(): Neo4jGraphQL {
    //     return this.gql.schema;
    // }

    // getModel(model: string): Model {
    //     return this.gql.ogm.model(model);
    // }

    // async readGql<T>(
    //     model: Model,
    //     selectionSet: DocumentNode,
    //     where: any,
    //     options?: any | undefined
    // ) {
    //     const result: T = await model.find({
    //         selectionSet,
    //         where,
    //         options
    //     });

    //     return result;
    // }

    // async createGql<T>(model: Model, input: T) {
    //     const created = await model.create({
    //         input: [input]
    //     });
    //     return created;
    // }

    // async updateGql<T>(model: Model, id: string, data: T) {
    //     const updated = await model.update({
    //         where: { id: id },
    //         update: data
    //     });
    //     return updated;
    // }
}
