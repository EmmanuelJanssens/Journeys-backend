import { QueryResult } from "neo4j-driver";
import { Logger } from "@nestjs/common/services";
import { Injectable } from "@nestjs/common/decorators";
import { Experience, ExperienceDto } from "../entities/experience.entity";
import { Neo4jService } from "../neo4j/neo4j.service";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { EditJourneyExperiencesDto } from "./dto/edit-journey-dto";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
@Injectable()
export class JourneyRepository {
    logger = new Logger(JourneyRepository.name);
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Get a journey with its creator and the number of experiences
     * @param journey the id of the journey
     * @returns the following records [journey: JourneyNode, creator: string, count: number]
     */
    get(journey: string): Promise<QueryResult> {
        const query = `
            OPTIONAL MATCH (:POI)<-[exp:EXPERIENCE]-(journey:Journey{id: $journey})<-[:CREATED]-(user:User)
            RETURN journey, user.username AS creator, count(distinct exp) as count, collect(exp.images) as thumbnails`;
        const params = { journey };

        return this.neo4jService.read(query, params);
    }

    /**
     * create a journey and its experiences
     * @param user the user who creates the journey
     * @param journey the journey to create
     * @returns the created journey with its experiences
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
     * update a journey
     * @param user the user uid who updates the journey and who created it
     * @param journey  the journey to update with its id
     * @returns  the updated journey with its experiences
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
     * get an experience for a given journey and poi
     * @param user the user uid who created the experience
     * @param journey the id of the journey
     * @param poi the id of the poi
     * @returns the experience between the journey and the poi
     */
    getExperience(journey: string, poi: string): Promise<QueryResult> {
        const query = `MATCH (journey:Journey{ id: $journey })-[experience:EXPERIENCE]-(poi:POI{ id:$poi })
            RETURN experience
        `;
        return this.neo4jService.read(query, {
            journey,
            poi
        });
    }

    /**
     * Add a single experience to a given journey for a given poi
     * @param user the user uid who creates the experience
     * @param journey the journey to which the experience is added
     * @param poi the poi to which the experience is added
     * @param experience   the experience to add
     * @returns the added experience
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
     * get all experiences of a journey
     * @param id  the id of the journey
     * @returns the experiences of the journey
     */
    getExperiences(journey: string): Promise<QueryResult | undefined> {
        const query = `
            MATCH(journey: Journey{id : $journey})
            OPTIONAL MATCH (journey)-[experience:EXPERIENCE]-(poi:POI)
            RETURN  journey, collect(experience) as experiences, collect(poi) as pois
        `;

        return this.neo4jService
            .read(query, { journey })
            .then((result: QueryResult) => {
                return result;
            });
    }

    /**
     * update an experience belonging to a given journey and poi
     * @param user the user uid who created the experience
     * @param journey the id of the journey
     * @param poi the id of the poi
     * @param experience the experience to update
     * @returns the updated experience
     */
    updateExperience(
        user: string,
        journey: string,
        poi: string,
        experience: ExperienceDto
    ) {
        const query = `
            UNWIND $experience as data
            MATCH (user:User{uid:$user})-[:CREATED]->(journey:Journey{id:$journey})-[experience:EXPERIENCE]->(poi: POI{id:$poi})
            SET experience.date = data.date,
                experience.title = data.title,
                experience.images = data.images,
                experience.description = data.description
            RETURN experience
        `;
        const params = { user, journey, poi, experience };
        return this.neo4jService.write(query, params);
    }

    /**
     * delete an experience
     * @param user the user uid who created the experience
     * @param journey the id of the journey to which the experience belongs
     * @param poi the id of the poi to which the experience belongs
     * @returns the deleted experience
     */
    deleteExperience(user: string, journey: string, poi: string) {
        const query = `
            MATCH (user:User{uid:$user})-[:CREATED]->(journey:Journey{id:$journey})-[experience:EXPERIENCE]->(poi: POI{id:$poi})
            DELETE experience
            WITH experience, journey
            RETURN journey, collect(distinct experience)
        `;
        const params = { user, journey, poi };
        return this.neo4jService.write(query, params);
    }

    /**
     * Add a list of experiences to a given journey
     * @param journey the id of the journey
     * @param experiences the list of experiences to add
     * @returns the journey with its experiences
     */
    addExperiences(
        user: string,
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterestDto;
        }[]
    ): Promise<QueryResult> {
        const query = `
        MATCH(journey:Journey{id: $journey})-[:CREATED]-(user: User{uid: $user})
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
            user,
            journey,
            experiences
        });
    }

    /**
     * delete a journey and its experiences
     * @param user the user uid who created the journey
     * @param journey the id of the journey to delete
     * @returns returns the id of the deleted journey
     */
    async delete(user: string, journey: string): Promise<QueryResult> {
        const delExpRelationQuery = `
            MATCH (journey: Journey{id: $journey})
            WITH journey
            OPTIONAL MATCH (journey)-[experiences]->() DELETE experiences
            WITH journey
            OPTIONAL MATCH (user:User{uid: $user})-[created]->(journey) DELETE created
            WITH journey
            DELETE journey
        `;
        const params = { user, journey };
        return this.neo4jService.write(delExpRelationQuery, params);
    }

    /**
     * transactional query that edits a journey's experiences
     * @param user  the user uid who created the journey
     * @param journey the journey to edit
     * @param editDto the data to apply to the journey
     * @returns the updated journey
     */
    editJourneysExperiences(
        user: string,
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
                        MATCH (user:User{uid: $user})-[:CREATED]-(journey: Journey{id: $journey})-[experience]-(poi: POI{id: toDelete})
                        DELETE experience
                        WITH journey
                        RETURN journey`;
                    journeyResult = await tx.run(deleteExperiences, {
                        journey,
                        user,
                        delete: editDto.deleted
                    });
                }

                if (editDto.connected.length > 0) {
                    const addExperiences = `
                        MATCH (journey:Journey{id: $journey})<- [:CREATED]-(user:User{uid: $user})
                        UNWIND $experiences as data
                            MATCH(poi:POI{id: data.poi.id})
                            MERGE(journey)-[experience:EXPERIENCE]->(poi)
                            SET experience.date = data.experience.date,
                                experience.title =  data.experience.title,
                                experience.description =  data.experience.description,
                                experience.images = data.experience.images
                        RETURN  journey, collect(experience) as experiences, collect(poi) as pois `;
                    journeyResult = await tx.run(addExperiences, {
                        journey,
                        user,
                        experiences: editDto.connected
                    });
                }

                if (editDto.updated.length > 0) {
                    const updateExperiences = `
                        MATCH (journey:Journey{id: $journey})<-[:CREATED]-(user:User{uid: $user})
                        UNWIND $update as data
                            MATCH(poi:POI{id: data.poi.id})
                            MERGE(journey)-[experience:EXPERIENCE]->(poi)
                            SET experience.date = data.experience.date,
                                experience.title =  data.experience.title,
                                experience.description =  data.experience.description,
                                experience.images = data.experience.images
                        RETURN  journey, collect(experience) as experiences, collect(poi) as pois`;
                    journeyResult = await tx.run(updateExperiences, {
                        journey,
                        user,
                        update: editDto.updated
                    });
                }
                return journeyResult;
            })
            .finally(() => {
                session.close();
            });
    }

    /**
     * push an image to an experience
     * @param user user uid who created the journey
     * @param journey journey id to which the experience belongs
     * @param poi poi id to which the experience belongs
     * @param image image url to push
     * @returns the updated experience
     */
    async pushImage(
        user: string,
        journey: string,
        poi: string,
        image: string
    ): Promise<QueryResult> {
        const query = `
            MATCH (user:User{uid:$user})-[:CREATED]->(journey:Journey{id:$journey})-[experience:EXPERIENCE]->(poi: POI{id:$poi})
            SET experience.images = coalesce(experience.images, []) + $image
            RETURN experience
        `;
        const params = { user, journey, poi, image };
        return this.neo4jService.write(query, params);
    }
}
