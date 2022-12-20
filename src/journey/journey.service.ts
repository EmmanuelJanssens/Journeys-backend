import { Injectable } from "@nestjs/common";
import { JourneyRepository } from "./journey.repository";
import { Experience, ExperienceDto } from "../entities/experience.entity";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { NotFoundError } from "../errors/Errors";
import { JourneyNode } from "./entities/journey.entity";
import { PointToLocation } from "../entities/utilities";
import { ExperienceService } from "src/experience/experience.service";
@Injectable()
export class JourneyService {
    constructor(
        private journeyRepository: JourneyRepository,
        private experienceService: ExperienceService
    ) {}

    getRepository() {
        return this.journeyRepository;
    }

    /**
     * find a journey
     * @param id the journey id
     * @returns a journey dto
     */
    async findOne(id: string) {
        const queryResult = await this.journeyRepository.get(id);
        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey"),
            []
        );
        const foundJourney = journeyNode.getProperties() as JourneyDto;
        foundJourney.creator = queryResult.records[0].get("creator");
        foundJourney.experiencesAggregate = {
            count: queryResult.records[0].get("count")
        };
        const thumbnails = queryResult.records[0].get(
            "thumbnails"
        ) as string[][];
        foundJourney.thumbnails = thumbnails.reduce(
            (acc, curr) => acc.concat(curr),
            []
        );
        foundJourney.start = PointToLocation(journeyNode.getStart());
        foundJourney.end = PointToLocation(journeyNode.getEnd());

        return foundJourney;
    }

    /**
     * get experiences of a journey
     * @param journey_id  the journey id
     * @returns a journey with its experiences
     */
    // async getExperiences(journey_id: string) {
    //     const queryResult = await this.journeyRepository.getExperiences(
    //         journey_id
    //     );

    //     const journeyNode = new JourneyNode(
    //         queryResult.records[0].get("journey"),
    //         queryResult.records[0].get("experiences")
    //     );
    //     const journey = journeyNode.getProperties() as JourneyDto;
    //     const experiences = journeyNode.getExperiencesRelationships();
    //     journey.experiences = [];

    //     experiences.forEach((experience, idx) => {
    //         const poiNode = new PoiNode(
    //             queryResult.records[0].get("pois")[idx]
    //         );
    //         const poi = poiNode.getProperties();
    //         poi.location = PointToLocation(poi.location);
    //         journey.experiences.push({
    //             experience: experience.properties as ExperienceDto,
    //             poi: poi
    //         });
    //     });

    //     journey.start = PointToLocation(journeyNode.getStart());
    //     journey.end = PointToLocation(journeyNode.getEnd());

    //     journey.experiences.sort(
    //         (a, b) =>
    //             new Date(a..date).getTime() -
    //             new Date(b..date).getTime()
    //     );
    //     return journey;
    // }

    /**
     * create a journey with its optional experiences
     * @param user the user uid that created the journey
     * @param createJourney the journey to create
     * @returns the journey with its experiences
     */
    async create(user: string, createJourney: CreateJourneyDto) {
        //create the journey node first
        const journeyQueryResult = await this.journeyRepository.create(
            user,
            createJourney
        );
        const journeyNode = new JourneyNode(
            journeyQueryResult.records[0].get("journey")
        );

        const experiences = await this.experienceService.createMany(
            user,
            journeyNode.getId(),
            createJourney.experiences
        );
        const createdJourney = journeyNode.getProperties() as JourneyDto;
        createdJourney.creator = user;
        createdJourney.experiences = experiences;
        createdJourney.start = PointToLocation(journeyNode.getStart());
        createdJourney.end = PointToLocation(journeyNode.getEnd());
        //create the experiences

        // createdJourney.experiences = [];
        // journeyNode.getExperiencesRelationships().forEach((rel, idx) => {
        //     const poiNode = new PoiNode(
        //         queryResult.records[0].get("pois")[idx]
        //     );
        //     const poi = poiNode.getProperties();
        //     poi.location = PointToLocation(poi.location);
        //     createdJourney.experiences.push({
        //         experience: rel.properties as Experience,
        //         poi: poi
        //     });
        // });
        // createdJourney.start = PointToLocation(journeyNode.getStart());
        // createdJourney.end = PointToLocation(journeyNode.getEnd());

        return createdJourney;
    }

    /**
     * updates a journey, first find journey and set appropriate fields that have to be
     * updated
     * @param user the user uid that created the journey
     * @param journey the journey to update
     * @returns the updated journey
     */
    async update(user: string, journey: UpdateJourneyDto) {
        const found = await this.findOne(journey.id);
        journey.description = journey.description || found.description;
        journey.title = journey.title || found.title;
        journey.thumbnail = journey.thumbnail || found.thumbnail;
        journey.visibility = journey.visibility || found.visibility;

        const queruResult = await this.journeyRepository.update(user, journey);
        const journeyNode = new JourneyNode(
            queruResult.records[0].get("journey"),
            []
        );
        const updatedJourney = journeyNode.getProperties() as JourneyDto;

        updatedJourney.start = PointToLocation(journeyNode.getStart());
        updatedJourney.end = PointToLocation(journeyNode.getEnd());
        return updatedJourney;
    }

    /**
     * deletes a journey and its experiences
     * @param user the user uid that created the journey
     * @param journey the journey to delete
     * @returns the deleted journey id
     */
    async delete(user: string, journey: string) {
        const result = await this.journeyRepository.delete(user, journey);
        return result;
    }

    /**
     * add a list of experiences to a journey
     * @param journey the journey id to wich the experiences will be added
     * @param experiences the experiences to add
     * @returns the updated journey
     */
    // async addExperiences(
    //     user: string,
    //     journey: string,
    //     experiences: {
    //         experience: Experience;
    //         poi: PointOfInterestDto;
    //     }[]
    // ) {
    //     const queryResult = await this.journeyRepository.addExperiences(
    //         user,
    //         journey,
    //         experiences
    //     );
    //     const journeyNode = new JourneyNode(
    //         queryResult.records[0].get("journey"),
    //         queryResult.records[0].get("experiences")
    //     );
    //     const updatedJourney = journeyNode.getProperties() as JourneyDto;

    //     updatedJourney.experiences = [];
    //     journeyNode.getExperiencesRelationships().forEach((rel, idx) => {
    //         const poiNode = new PoiNode(
    //             queryResult.records[0].get("pois")[idx]
    //         );
    //         const poi = poiNode.getProperties();
    //         poi.location = PointToLocation(poi.location);
    //         updatedJourney.experiences.push({
    //             experience: rel.properties as Experience,
    //             poi: poi
    //         });
    //     });
    //     updatedJourney.start = PointToLocation(journeyNode.getStart());
    //     updatedJourney.end = PointToLocation(journeyNode.getEnd());

    //     return updatedJourney;
    // }

    /**
     * add an experience to a journey
     * @param user the user uid that created the journey
     * @param journey the journey id to wich the experience will be added
     * @param poi the poi id to wich the experience will be added
     * @param experience the experience to add
     * @returns the updated experience
     */
    async addExperience(
        user: string,
        journey: string,
        poi: string,
        experience: Experience
    ) {
        const queryResult = await this.journeyRepository.addExperience(
            user,
            journey,
            poi,
            experience
        );
        return queryResult.records[0].get("experience").properties;
    }

    /**
     * delete an experience from a journey
     * @param user the user uid that created the journey
     * @param journey the journey id to wich the experience belongs
     * @param poi the poi id to wich the experience belongs
     * @returns the deleted experience
     **/
    // async deleteExperience(user: string, journey: string, poi: string) {
    //     const queryResult = await this.journeyRepository.deleteExperience(
    //         user,
    //         journey,
    //         poi
    //     );

    //     const updatedJourney = await this.getExperiences(journey);

    //     return updatedJourney;
    // }

    /**
     *  get all experiences of a journey
     * @param journey the journey id
     * @param poi the poi id
     * @returns the experiences of the journey
     */
    async getExperience(journey: string, poi: string) {
        const queryResult = await this.journeyRepository.getExperience(
            journey,
            poi
        );
        if (queryResult.records.length == 0)
            throw new NotFoundError("could not find experience");
        return queryResult.records[0].get("experience").properties;
    }

    /**
     * updates an experience
     * @param journey the journey id
     * @param poi the poi id
     * @param experience the experience to update
     * @returns the updated experience
     */
    async updateExperience(
        user: string,
        journey: string,
        poi: string,
        experience: ExperienceDto
    ) {
        const existingExp = (await this.getExperience(
            journey,
            poi
        )) as ExperienceDto;
        const toUpdate: ExperienceDto = {
            date: experience.date || existingExp.date,
            description: experience.description || existingExp.description,
            title: experience.title || existingExp.title,
            images: experience.images || existingExp.images
        };
        const queryResult = await this.journeyRepository.updateExperience(
            user,
            journey,
            poi,
            toUpdate
        );
        return queryResult.records[0].get("experience").properties;
    }

    /**
     * edits a journey and its experiences
     * @param user the user uid that created the journey
     * @param journey the journey id
     * @param editDto the journey to update
     * @returns the updated journey
     */
    // async editJourneysExperiences(
    //     user: string,
    //     journey: string,
    //     editDto: EditJourneyExperiencesDto
    // ) {
    //     await this.journeyRepository.editJourneysExperiences(
    //         user,
    //         journey,
    //         editDto
    //     );

    //     return this.getExperiences(journey);
    // }

    /**
     * push an image to the images array of an experience
     * @param user the user uid that created the journey
     * @param journey the journey id
     * @param poi the poi id
     * @param image the image to push
     * @returns the updated experience
     * */
    async pushImageToExperience(
        user: string,
        journey: string,
        poi: string,
        image: string
    ) {
        const queryResult = await this.journeyRepository.pushImage(
            user,
            journey,
            poi,
            image
        );
        return queryResult.records[0].get("experience").properties;
    }
}
