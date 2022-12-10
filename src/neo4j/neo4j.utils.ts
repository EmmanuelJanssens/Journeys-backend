import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j-config.interface";
import { OGM } from "@neo4j/graphql-ogm";
import { Neo4jGraphQL } from "@neo4j/graphql";
import { gql } from "apollo-server-express";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Location {
    @Field((type) => Number)
    latitude: number;

    @Field((type) => Number)
    longitude: number;
}

@ObjectType()
export class POI {
    @Field((type) => ID)
    id: number;

    @Field()
    name: string;

    @Field()
    location: Location;
}
export type AppConfig = {
    driver: Driver;
};

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
    //create neo4j driver
    const driver: Driver = neo4j.driver(
        `${config.scheme}://${config.host}:${config.port}`,
        neo4j.auth.basic(config.username, config.password)
    );
    await driver.getServerInfo();

    return driver;
};

export const PoiModel = (ogm: OGM) => ogm.model("POI");
export const JourneyModel = (ogm: OGM) => ogm.model("Journey");
export const UserModel = (ogm: OGM) => ogm.model("User");
export const TagModel = (ogm: OGM) => ogm.model("Tag");
