import { QueryResult } from "neo4j-driver";
import { Experience } from "src/entities/experience.entity";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { IRepository } from "src/repository/IRepository";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { Journey } from "./entities/journey.entity";
import * as uuid from "uuid";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";
import { Logger } from "@nestjs/common/services";

export class JourneyRepository extends IRepository<JourneyDto> {
    logger = new Logger(JourneyRepository.name);
    constructor(private readonly neo4jService: Neo4jService) {
        super();
    }

    get(id: string): Promise<Journey | undefined> {
        return this.neo4jService
            .read(
                "MATCH(journey:Journey{id: $id})-[:CREATED]-(user:User) RETURN journey, user",
                {
                    id: id
                }
            )
            .then((result: QueryResult) => {
                if (result.records.length == 0) throw Error("Nothing found");
                const journey = result.records[0].get("journey").properties;
                journey.creator =
                    result.records[0].get("user").properties.username;
                journey.experiences = [];
                return journey;
            });
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

        let transaction: Journey;

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
                    throw Error("Could not create Journey");
                const createdJourney = createdJourneyResult.records[0].get(
                    "journey"
                ).properties as Journey;

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
                        throw Error("Could not create Experiences");
                    const journeyWithExperiences =
                        journeyWithExperiencesResult.records[0].get("journey")
                            .properties as Journey;

                    journeyWithExperiences.experiences = [];

                    for (const record of journeyWithExperiencesResult.records) {
                        const experience = record.get("experience").properties;

                        experiences.push(experience);
                    }
                }

                createdJourney.experiences = experiences;
                return createdJourney;
            });

            //close session
            session.close();
            return transaction;
        } catch (e) {
            this.logger.debug((e as Error).stack);
            session.close();
            throw Error("Error while creating, transaction aborted");
        }
    }

    update(user: string, journey: UpdateJourneyDto): Promise<Journey> {
        const query = `
            UNWIND $journey as updated
            MATCH (journey:Journey{id: updated.id})<-[:CREATED]-(user: User{uid: $user})
                SET journey.title = updated.title,
                SET journey.description = updated.description,
                SET journey.thumbnail = updated.thumbnail
            RETURN journey
    `;

        return this.neo4jService
            .write(query, {
                journey,
                user
            })
            .then((result: QueryResult) => {
                if (result.records.length == 0) throw Error("could not create");
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
                if (result.records.length > 0) {
                    throw Error("bad operation, too many records");
                }
                if (result.records.length == 1) {
                    return result.records[0].get("experince").properties;
                } else {
                    return undefined;
                }
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
            RETURN  journey, experience, poi
        `;

        return this.neo4jService
            .read(query, { journey })
            .then((result: QueryResult) => {
                const journey = result.records[0].get("journey").properties;
                journey.experiences = [];
                for (const record of result.records) {
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
            poi: PointOfInterest;
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
                const journey = result.records[0].get("journey").properties;
                journey.experiences = [];
                for (const record of result.records) {
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

        const delCreatorRelationQuery = `MATCH (user:User{uid: $user})-[:CREATED]-(journey: Journey{id: $journey})`;

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
