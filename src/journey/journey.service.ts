import { Injectable } from "@nestjs/common";
import { JourneyRepository } from "./journey.repository";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { Journey, JourneyNode } from "./entities/journey.entity";
import { PointToLocation } from "../entities/utilities";
import { ExperienceService } from "../experience/experience.service";
import {
    Experience,
    ExperienceNode
} from "../experience/entities/experience.entity";
import {
    PoiNode,
    PointOfInterest
} from "../point-of-interest/entities/point-of-interest.entity";

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
    async findOne(id: string): Promise<{
        journey: Journey;
        experiencesCount: number;
        thumbnails: string[];
    }> {
        const queryResult = await this.journeyRepository.get(id);
        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey"),
            []
        );

        //build journey
        const journey = journeyNode.getProperties() as Journey;
        journey.creator = queryResult.records[0].get("creator");
        journey.start = PointToLocation(journeyNode.getStart());
        journey.end = PointToLocation(journeyNode.getEnd());

        //additional journey information
        const experiencesCount = queryResult.records[0].get("count");
        const thumbnails = queryResult.records[0].get("thumbnails");
        return {
            journey,
            experiencesCount,
            thumbnails
        };
    }

    /**
     * get experiences of a journey
     * @param journey_id  the journey id
     * @returns a journey with its experiences
     */
    async getExperiences(journey_id: string): Promise<{
        journey: Journey;
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[];
    }> {
        const queryResult = await this.journeyRepository.getExperiences(
            journey_id
        );
        const journey = new JourneyNode(
            queryResult.records[0].get("journey")
        ).getProperties() as Journey;

        const experiences = queryResult.records.map((record, idx) => {
            return {
                experience: new ExperienceNode(record.get("experience"))
                    .properties as Experience,
                poi: new PoiNode(
                    record.get("poi")
                ).getProperties() as PointOfInterest
            };
        });

        return {
            journey,
            experiences
        };
    }

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

        //create the experiences
        const experiences: Experience[] =
            await this.experienceService.createMany(
                user,
                journeyNode.getId(),
                createJourney.experiences
            );
        const createdJourney = journeyNode.getProperties() as Journey;

        return {
            ...createdJourney,
            experiences: experiences
        };
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
        journey.description = journey.description || found.journey.description;
        journey.title = journey.title || found.journey.description;
        journey.thumbnail = journey.thumbnail || found.journey.thumbnail;
        journey.visibility = journey.visibility || found.journey.visibility;

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
