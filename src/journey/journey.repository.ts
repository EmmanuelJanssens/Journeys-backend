import { QueryResult } from "neo4j-driver";
import { Experience } from "entities/experience.entity";
import { Neo4jService } from "neo4j/neo4j.service";
import { IRepository } from "repository/IRepository";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { Journey } from "./entities/journey.entity";
import * as uuid from "uuid";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { Logger } from "@nestjs/common/services";
import { Injectable } from "@nestjs/common/decorators";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";

import { BadInputError, CreationError, NotFoundError } from "errors/Errors";
@Injectable()
export class JourneyRepository extends IRepository<JourneyDto> {
    logger = new Logger(JourneyRepository.name);

    constructor(private readonly neo4jService: Neo4jService) {
        super();
    }

    /**
     *
     * @param journey
     * @returns data object representing a journey
     * @throws BadInputError, NotFoundError, Error
     */
    async get(journey: string): Promise<JourneyDto | undefined> {
        const getJourneyQuery = `
            MATCH (journey:Journey{id: $journey})-[:CREATED]-(user:User) RETURN journey, user.username AS creator`;
        const getExpCountQuery = `
            MATCH (journey:Journey{id: $journey})-[n:EXPERIENCE]->(:POI) RETURN COUNT(n) as count`;
        const params = { journey };

        const session = this.neo4jService.getReadSession();
        if (!session) throw new Error("could not create read session");
        if (journey.length == 0) throw new BadInputError();

        let transaction: JourneyDto;
        try {
            transaction = await session.executeRead(async (tw) => {
                const journeyResult = await tw.run(getJourneyQuery, params);

                if (journeyResult.records.length == 0)
                    throw new NotFoundError("Journey not found");
                if (journeyResult.records.length > 1)
                    throw new BadInputError("Returned multiple journeys");

                const records = journeyResult.records[0];

                if (
                    !records.get("journey") ||
                    !records.get("creator") ||
                    !records.get("count")
                )
                    throw new Error(
                        "Error requesting fields journey|creator|count"
                    );

                const journey = journeyResult.records[0].get("journey")
                    .properties as JourneyDto;
                const creator = journeyResult.records[0].get("creator");

                journey.creator = creator;

                const countResult = await tw.run(getExpCountQuery, params);
                const count = Number(countResult.records[0].get("count"));

                journey.experiencesAggregate = {
                    count: count
                };
                return journey;
            });

            session.close();
            return transaction;
        } catch (e) {
            this.logger.debug(e.message);
            throw e;
        }
    }

    async create(user: string, journey: CreateJourneyDto): Promise<JourneyDto> {
        const id = uuid.v4();

        const createJourneyQuery = `
        UNWIND $journey as new
        MATCH(user:User{uid: $user})
        MERGE(journey:Journey{
            id:$id,
            title: new.title,
            description: new.description,
            start: point({srid:4326,x: new.start.latitude, y: new.start.longitude}),
            end: point({srid:4326,x: new.end.latitude, y: new.end.longitude})
        })<-[:CREATED]-(user)
        RETURN journey`;

        const addExperiencesQuery = `
        MATCH(journey:Journey{id: $journey})
            UNWIND $experiences as data
            MATCH(poi:POI{id: data.poi.id})
            CREATE(journey)-[experience:EXPERIENCE{
                date : data.experience.date,
                title :  data.experience.title,
                description :  data.experience.description,
                images : data.experience.images
            }]->(poi)
        RETURN  journey, experience, poi`;

        const session = this.neo4jService.getWriteSession();

        let transaction: JourneyDto;

        try {
            //start simple write transaction
            transaction = await session.executeWrite(async (tx) => {
                //create the new journey
                const createdJourneyResult = await tx.run(createJourneyQuery, {
                    user,
                    journey,
                    id
                });

                if (createdJourneyResult.records.length == 0)
                    throw new CreationError("Could not create Journey");
                if (!createdJourneyResult.records[0].get("journey"))
                    throw new Error("Could not request fields journey");

                const createdJourney = createdJourneyResult.records[0].get(
                    "journey"
                ).properties as JourneyDto;

                const experiences = [];
                //add experiences to newly created journey
                if (
                    journey.experiences != undefined &&
                    journey.experiences.length > 0
                ) {
                    const journeyWithExperiencesResult = await tx.run(
                        addExperiencesQuery,
                        {
                            journey: createdJourney.id,
                            experiences: journey.experiences
                        }
                    );

                    if (journeyWithExperiencesResult.records.length == 0)
                        throw new CreationError(
                            "Could not create experiences for journey"
                        );
                    if (
                        !journeyWithExperiencesResult.records[0].get(
                            "journey"
                        ) ||
                        !journeyWithExperiencesResult.records[0].get(
                            "experience"
                        )
                    )
                        throw new Error(
                            "Could not request fields journey | experience"
                        );

                    const journeyWithExperiences =
                        journeyWithExperiencesResult.records[0].get("journey")
                            .properties as JourneyDto;

                    journeyWithExperiences.experiences = [];

                    for (const record of journeyWithExperiencesResult.records) {
                        const experience = record.get("experience").properties;

                        experiences.push(experience);
                    }
                }

                createdJourney.experiences = experiences;
                createdJourney.experiencesAggregate = {
                    count: experiences.length
                };
                return createdJourney;
            });

            //close session
            session.close();
            return transaction;
        } catch (e) {
            this.logger.debug((e as Error).stack);
            session.close();
            throw e;
        }
    }

    update(user: string, journey: UpdateJourneyDto): Promise<JourneyDto> {
        const query = `
            UNWIND $journey as updated
            MATCH (journey:Journey{id: updated.id})<-[:CREATED]-(user: User{uid: $user})
                SET journey.title = updated.title,
                 journey.description = updated.description,
                 journey.thumbnail = updated.thumbnail,
                 journey.visibility = updated.visibility
            RETURN journey
    `;

        return this.neo4jService
            .write(query, {
                journey,
                user
            })
            .then((result: QueryResult) => {
                if (result.records.length == 0)
                    throw new CreationError("could not update");
                const props = result.records[0].get("journey").properties;

                //transform coordinates properly
                return props;
            });
    }

    getExperience(
        journey: string,
        poi: string
    ): Promise<Experience | undefined> {
        const query = `
            MATCH(journey:Journey{ id: $journey })-[experience:EXPERIENCE]-(poi:POI{ id:$poi })
            RETURN experience
        `;
        return this.neo4jService
            .read(query, {
                journey,
                poi
            })
            .then((result: QueryResult) => {
                if (result.records.length == 0)
                    throw new NotFoundError("could not find experience");
                if (result.records.length > 0) {
                    throw Error("bad operation, too many records");
                }
                return result.records[0].get("experince").properties;
            });
    }

    addExperience(
        user: string,
        journey: string,
        poi: string,
        experience: Experience
    ): Promise<Experience | undefined> {
        const query = `
            MATCH(journey:Journey{id: $journey}) - [:CREATED] - (user: User({uid: $user}))
            MATCH(poi: POI{id: $poi})
            UNWIND $experience as experience
            CREATE(journey)-[e:EXPERIENCE{
                 date : experience.experience.date,
                 title :  experience.experience.title,
                 description :  experience.experience.description,
                 images : experience.experience.images
            }]->(poi)
            RETURN experience
        `;
        return this.neo4jService
            .write(query, {
                user,
                journey,
                poi,
                experience
            })
            .then((result: QueryResult) => {
                if (result.records.length == 0)
                    throw new CreationError("Could not create experience");
                if (result.records.length > 1)
                    throw new Error("Bad request created too many experiences");
                const props = result.records[0].get("experience");
                return props as Experience;
            });
    }

    /**
     *
     * @param id Journey'ID
     */
    getExperiences(journey: string): Promise<Journey | undefined> {
        const query = `
            MATCH(journey: Journey{id : $journey})-[experience:EXPERIENCE]-(poi:POI)
            RETURN  journey, experience, poi, COUNT(Experiences) as count
        `;

        return this.neo4jService
            .read(query, { journey })
            .then((result: QueryResult) => {
                if (result.records[0].length == 0)
                    throw new NotFoundError(
                        "Could not find anything for journeys|experiences"
                    );
                if (!result.records[0].get("journey"))
                    throw new Error("could not access journey");
                const journey = result.records[0].get("journey").properties;
                journey.experiences = [];
                for (const record of result.records) {
                    if (!record.get("experience") || !record.get("poi"))
                        throw new Error("could not access poi|experiences");
                    const experience = record.get("experience").properties;
                    experience.date = new Date(experience.date).toISOString();
                    const poi = record.get("poi").properties;
                    poi.location = {
                        latitude: poi.location.x,
                        longitude: poi.location.y
                    };
                    journey.experiences.push({
                        data: experience,
                        poi: poi
                    });
                }

                return journey;
            });
    }

    addExperiences(
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterestDto;
        }[]
    ): Promise<Journey | undefined> {
        const query = `
        MATCH(journey:Journey{id: $journey})
        UNWIND $experiences as data
        MATCH(poi:POI{id: data.poi.id})
        MERGE(journey)-[experience:EXPERIENCE{
             date : data.experience.date,
             title :  data.experience.title,
             description :  data.experience.description,
             images : data.experience.images
        }]->(poi)
        RETURN  journey, experience, poi
    `;
        return this.neo4jService
            .write(query, {
                journey,
                experiences
            })
            .then((result: QueryResult) => {
                if (result.records.length == 0)
                    throw new CreationError("could not add experiences");
                if (!result.records[0].get("journey"))
                    throw new Error("could not access journey");
                const journey = result.records[0].get("journey").properties;
                journey.experiences = [];
                for (const record of result.records) {
                    if (!record.get("experience"))
                        throw new Error("could not access poi|experiences");
                    const experience = record.get("experience").properties;
                    journey.experiences.push(experience);
                }
                return journey;
            });
    }

    async delete(user: string, journey: string): Promise<string | undefined> {
        const delExpRelationQuery = `
            MATCH (user:User{uid: $user})-[:CREATED]-(journey: Journey{id: $journey})-[rel]-() DELETE rel
        `;

        const delCreatorRelationQuery = `MATCH (user:User{uid: $user})-[rel:CREATED]-(journey: Journey{id: $journey}) DELETE rel`;

        const deleteQuery = `MATCH (journey: Journey{id: $journey}) DELETE journey`;

        const session = this.neo4jService.getWriteSession();
        let transactionResult: string;
        try {
            transactionResult = await session.executeWrite((tx) => {
                tx.run(delExpRelationQuery, {
                    user,
                    journey
                });

                tx.run(delCreatorRelationQuery, {
                    user,
                    journey
                });

                tx.run(deleteQuery, {
                    journey
                });

                return journey;
            });
            session.close();
            return transactionResult;
        } catch (e) {
            this.logger.debug(e.stack);
            session.close();
            throw Error("Transaction error, could not delete");
        }
    }
}
