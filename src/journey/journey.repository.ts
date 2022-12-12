import { QueryResult } from "neo4j-driver";
import { Experience, ExperienceDto } from "entities/experience.entity";
import { Neo4jService } from "neo4j/neo4j.service";
import { CreateJourneyDto } from "./dto/create-journey.dto";

import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { Logger } from "@nestjs/common/services";
import { Injectable } from "@nestjs/common/decorators";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";
import { EditJourneyExperiencesDto } from "./dto/edit-journey-dto";
@Injectable()
export class JourneyRepository {
    logger = new Logger(JourneyRepository.name);
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     *  find a journey and returns it properties excluding experiences
     * @param journey
     * @returns  the folowing records [journey : JourneyNode ,creator: string ,count: number]
     */
    get(journey: string): Promise<QueryResult> {
        const query = `
            OPTIONAL MATCH (:POI)<-[exp:EXPERIENCE]-(journey:Journey{id: $journey})<-[:CREATED]-(user:User)
            RETURN journey, user.username AS creator, count(distinct exp) as count`;
        const params = { journey };

        return this.neo4jService.read(query, params);
    }

    /**
     * Create a simple journey
     * runs in a transaction because we need to first of create
     * the journey, and afterwards connect experiences to it if
     * the user added experiences during the creation process
     * @param user
     * @param journey
     * @returns the following records [journey: JourneyNode, experiences: ExperienceRelation[], pois: PoiNode[]]
     */
    async create(
        user: string,
        journey: CreateJourneyDto
    ): Promise<QueryResult> {
        const createJourneyQuery = `
        UNWIND $journey as new
            MATCH(user:User{uid: $user})
                CREATE (journey:Journey{
                    id:apoc.create.uuid(),
                    title: new.title,
                    description: new.description,
                    start: point({srid:4326,x: new.start.longitude, y: new.start.latitude}),
                    end: point({srid:4326,x: new.end.longitude, y: new.end.latitude})
                })<-[:CREATED]-(user)
        WITH journey
            UNWIND $experiences as data
            MATCH(journey:Journey{id: journey.id})
            MATCH(poi:POI{id:data.poi.id})
                    CREATE(journey)-[experience:EXPERIENCE{
                        date :data.experience.date,
                        title :data.experience.title,
                        description : data.experience.description,
                        images :data.experience.images
                    }]->(poi)
        RETURN journey, collect(experience) as experiences, collect(poi) as pois`;
        const params = { user, journey, experiences: journey.experiences };
        return this.neo4jService.write(createJourneyQuery, params);
    }

    /**
     * Update a journey
     * @param user
     * @param journey
     * @returns
     */
    update(user: string, journey: UpdateJourneyDto): Promise<QueryResult> {
        const query = `
            UNWIND $journey as updated
            MATCH (journey:Journey{id: updated.id})<-[:CREATED]-(user: User{uid: $user})
                SET journey.title = updated.title,
                 journey.description = updated.description,
                 journey.thumbnail = updated.thumbnail,
                 journey.visibility = updated.visibility
            RETURN journey
    `;

        return this.neo4jService.write(query, {
            journey,
            user
        });
    }

    /**
     * get the experiences of a journey
     * @param journey
     * @param poi
     * @returns
     */
    getExperience(journey: string, poi: string): Promise<QueryResult> {
        const query = `
            MATCH(journey:Journey{ id: $journey })-[experience:EXPERIENCE]-(poi:POI{ id:$poi })
            RETURN experience
        `;
        return this.neo4jService.read(query, {
            journey,
            poi
        });
    }

    /**
     * Add a single experience to a given journey for a given poi
     * @param user
     * @param journey
     * @param poi
     * @param experience
     * @returns
     */
    addExperience(
        user: string,
        journey: string,
        poi: string,
        experience: Experience
    ): Promise<QueryResult> {
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
        return this.neo4jService.write(query, {
            user,
            journey,
            poi,
            experience
        });
    }

    /**
     * get the experiences of a journey
     * @param id Journey'ID
     * @returns a journey with its experiences
     */
    getExperiences(journey: string): Promise<QueryResult | undefined> {
        const query = `
            MATCH(journey: Journey{id : $journey})-[experience:EXPERIENCE]-(poi:POI)
            RETURN  journey, collect(experience) as experiences, collect(poi) as pois
        `;

        return this.neo4jService
            .read(query, { journey })
            .then((result: QueryResult) => {
                return result;
            });
    }

    updateExperience(journey: string, poi: string, experience: ExperienceDto) {
        const query = `
            UNWIND $experience as data
            MATCH(journey:Journey{id:$journey})-[experience:EXPERIENCE]->(poi: POI{id:$poi})
            SET experience.date = data.date,
                experience.title = data.title,
                experience.images = data.images,
                experience.description = data.description
            RETURN experience
        `;
        const params = { journey, poi, experience };
        return this.neo4jService.write(query, params);
    }
    /**
     * Add a list of experiences to a given journey
     * @param journey
     * @param experiences
     * @returns
     */
    addExperiences(
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterestDto;
        }[]
    ): Promise<QueryResult> {
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
        RETURN  journey, collect(experience) as experiences, collect(poi) as pois
    `;
        return this.neo4jService.write(query, {
            journey,
            experiences
        });
    }

    async delete(user: string, journey: string): Promise<QueryResult> {
        const delExpRelationQuery = `
            MATCH (user:User{uid: $user})-[:CREATED]-(journey: Journey{id: $journey})-[experiences]-() DELETE experiences
            WITH user,journey
            MATCH (user:User{uid: $user})-[created]-(journey: Journey{id: $journey}) DELETE created
            WITH user, journey
            MATCH (journey: Journey{id: $journey}) DELETE journey
        `;
        const params = { user, journey };
        return this.neo4jService.write(delExpRelationQuery, params);
    }

    editJourneysExperiences(
        userUid: string,
        journey: string,
        editDto: EditJourneyExperiencesDto
    ) {
        const session = this.neo4jService.getWriteSession();

        return session
            .executeWrite(async (tx) => {
                let journeyResult = await this.getExperiences(journey);

                if (editDto.deleted.length > 0) {
                    const deleteExperiences = `
                        UNWIND $delete as toDelete
                        MATCH (user:User{uid: $userUid})-[:CREATED]-(journey: Journey{id: $journey})-[experience]-(poi: POI{id: toDelete})
                        DELETE experience
                        WITH journey
                        RETURN journey`;
                    journeyResult = await tx.run(deleteExperiences, {
                        journey,
                        userUid,
                        delete: editDto.deleted
                    });
                }

                if (editDto.connected.length > 0) {
                    const addExperiences = `
                        MATCH (journey:Journey{id: $journey})<- [:CREATED]-(user:User{uid: $userUid})
                        UNWIND $experiences as data
                            MATCH(poi:POI{id: data.poi.id})
                            MERGE(journey)-[experience:EXPERIENCE{
                                date : data.experience.date,
                                title :  data.experience.title,
                                description :  data.experience.description,
                                images : data.experience.images
                            }]->(poi)
                        RETURN  journey, collect(experience) as experiences, collect(poi) as pois `;
                    journeyResult = await tx.run(addExperiences, {
                        journey,
                        userUid,
                        experiences: editDto.connected
                    });
                }

                if (editDto.updated.length > 0) {
                    const updateExperiences = `
                        MATCH (journey:Journey{id: $journey})<-[:CREATED]-(user:User{uid: $userUid})
                        UNWIND $update as data
                            MATCH(journey)-[experience:EXPERIENCE]->(poi:POI{id: data.poi.id})
                            SET experience.date = data.experience.date,
                                experience.title = data.experience.title,
                                experience.description = data.experience.description,
                                experience.images = data.experience.images
                        RETURN  journey, collect(experience) as experiences, collect(poi) as pois`;
                    journeyResult = await tx.run(updateExperiences, {
                        journey,
                        userUid,
                        update: editDto.updated
                    });
                }
                return journeyResult;
            })
            .finally(() => {
                session.close();
            });
    }
}
