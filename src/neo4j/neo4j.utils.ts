import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j-config.interface";
import { OGM } from "@neo4j/graphql-ogm";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { gql } from "apollo-server-express";
import * as connect from "connect-neo4j";

const typeDefs = gql`
    type POI {
        id: ID!
        name: String!
        description: String
        location: Point!
        journeys: [Journey!]!
            @relationship(
                type: "EXPERIENCE"
                direction: IN
                properties: "Experience"
            )
    }

    type Journey {
        id: ID!
        title: String!

        start: Location @relationship(type: "START", direction: OUT)
        end: Location @relationship(type: "END", direction: OUT)
        experiences: [POI!]!
            @relationship(
                type: "EXPERIENCE"
                direction: OUT
                properties: "Experience"
            )
        creator: User! @relationship(type: "CREATED", direction: IN)
    }

    type User {
        email: String!
        firstName: String!
        lastName: String!
        password: String!
        username: String!
        journeys: [Journey!]! @relationship(type: "CREATED", direction: OUT)
        experiences: [POI!]!
            @relationship(
                type: "EXPERIENCE"
                direction: OUT
                properties: "Experience"
            )
    }

    type Location {
        address: ID @id
        latitude: Float!
        longitude: Float!
    }
    interface Experience @relationshipProperties {
        date: DateTime
        description: String
        images: [String]
        order: Int
    }
`;

export type AppConfig = {
    driver: Driver;
    ogm: OGM;
    schema: Neo4jGraphQL;
};

export const createDriver = async (config: Neo4jConfig): Promise<AppConfig> => {
    //create neo4j driver
    const driver: Driver = neo4j.driver(
        `${config.scheme}://${config.host}:${config.port}`,
        neo4j.auth.basic(config.username, config.password)
    );
    await driver.getServerInfo();

    //create OGM
    const ogm = new OGM({ typeDefs, driver });
    await ogm.init();

    //create neo4j schema
    const neo4j_scheme = new Neo4jGraphQL({
        typeDefs,
        driver
    });

    return { driver, ogm, schema: neo4j_scheme };
};

export const Poi = (ogm: OGM) => ogm.model("POI");
export const Journey = (ogm: OGM) => ogm.model("Journey");
export const User = (ogm: OGM) => ogm.model("User");
