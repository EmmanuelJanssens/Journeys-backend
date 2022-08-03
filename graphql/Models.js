const { OGM } = require('@neo4j/graphql-ogm');
const { gql } = require('apollo-server-express');
const { Neo4jGraphQL } = require('@neo4j/graphql');

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password'),
);

const typeDefs = gql`


type POI {
    id: ID!
    name: String!
    location: Point!
    journeys: [Journey!]! @relationship(type: "EXPERIENCE",direction:IN, properties: "Experience")
}


type Journey{
    id: ID!
    title: String!
    start: Point!
    end: Point!
    experiences:  [POI!]! @relationship(type: "EXPERIENCE",direction:OUT, properties: "Experience")
    creator: User! @relationship(type: "CREATED",direction:IN)
}

type User{
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    userName: String!
    journeys: [Journey!]! @relationship(type: "CREATED",direction:OUT)
    experiences: [POI!]! @relationship(type: "EXPERIENCE", direction:OUT, properties: "Experience") 
}

enum SortDirection{
    ASC
    DESC
}

input POISort {
    name: SortDirection
}

interface Experience @relationshipProperties {
    date: DateTime
    description: String
    images: [String]
    order: Int
}


`;

const ogm = new OGM({ typeDefs, driver });
const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
});

module.exports = {
  POI: ogm.model('POI'),
  Journey: ogm.model('Journey'),
  User: ogm.model('User'),
  ogm,
  neoSchema,
};
