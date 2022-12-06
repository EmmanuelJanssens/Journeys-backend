import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j-config.interface";
import { OGM } from "@neo4j/graphql-ogm";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { gql } from "apollo-server-express";

const typeDefs = gql`
    type POI {
        id: ID!
        name: String!
        location: Point!
        poi: [POI!]! @relationship(type: "CREATED", direction: OUT)
        experiences: [Journey!]!
            @relationship(
                type: "EXPERIENCE"
                direction: IN
                properties: "Experience"
            )
        journeys: [Journey!]!
            @relationship(
                type: "EXPERIENCE"
                direction: IN
                properties: "Experience"
            )
        tags: [Tag!]! @relationship(type: "IS_TYPE", direction: OUT)
        creator: [User!]! @relationship(type: "CREATED", direction: IN)
    }

    type Journey {
        id: ID!
        title: String!
        description: String
        start: Point!
        end: Point!
        thumbnail: String
        visibility: String!
        experiences: [POI!]!
            @relationship(
                type: "EXPERIENCE"
                direction: OUT
                properties: "Experience"
            )
        creator: User @relationship(type: "CREATED", direction: IN)
    }

    type User {
        uid: ID!
        username: String!
        firstName: String
        lastName: String
        banner: [String!]
        visibility: String!
        citation: String
        completed: Boolean
        journeys: [Journey!]! @relationship(type: "CREATED", direction: OUT)
        pois: [POI!]! @relationship(type: "CREATED", direction: OUT)
        experiences: [POI!]!
            @relationship(
                type: "EXPERIENCE"
                direction: OUT
                properties: "Experience"
            )
    }

    type Tag {
        type: ID! @id
        pois: [POI!]! @relationship(type: "IS_TYPE", direction: IN)
    }

    interface Experience @relationshipProperties {
        title: String
        date: DateTime!
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

export const PoiModel = (ogm: OGM) => ogm.model("POI");
export const JourneyModel = (ogm: OGM) => ogm.model("Journey");
export const UserModel = (ogm: OGM) => ogm.model("User");
export const TagModel = (ogm: OGM) => ogm.model("Tag");
