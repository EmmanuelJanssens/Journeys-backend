import { Injectable } from "@nestjs/common";
import { JourneyRepository } from "./journey.repository";
import { Experience, ExperienceDto } from "entities/experience.entity";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";
import { NotFoundError } from "errors/Errors";
import { QueryResult } from "neo4j-driver";
import { JourneyNode } from "./entities/journey.entity";
import { PointToLocation } from "entities/utilities";
import { PoiNode } from "point-of-interest/entities/point-of-interest.entity";

@Injectable()
export class JourneyService {
    constructor(private journeyRepository: JourneyRepository) {}

    getRepository() {
        return this.journeyRepository;
    }

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
        foundJourney.start = PointToLocation(journeyNode.getStart());
        foundJourney.end = PointToLocation(journeyNode.getEnd());

        return foundJourney;
    }

    async getExperiences(journey_id: string) {
        const queryResult = await this.journeyRepository.getExperiences(
            journey_id
        );

        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey"),
            queryResult.records[0].get("experiences")
        );
        const journey = journeyNode.getProperties() as JourneyDto;
        const experiences = journeyNode.getExperiencesRelationships();
        journey.experiences = [];

        experiences.forEach((experience, idx) => {
            const poiNode = new PoiNode(
                queryResult.records[0].get("pois")[idx]
            );
            const poi = poiNode.getProperties();
            poi.location = PointToLocation(poi.location);
            journey.experiences.push({
                experience: experience.properties as Experience,
                poi: poi
            });
        });

        journey.start = PointToLocation(journeyNode.getStart());
        journey.end = PointToLocation(journeyNode.getEnd());
        return journey;
    }

    async create(user: string, createJourney: CreateJourneyDto) {
        const queryResult = await this.journeyRepository.create(
            user,
            createJourney
        );
        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey"),
            queryResult.records[0].get("experiences")
        );
        const createdJourney = journeyNode.getProperties() as JourneyDto;

        createdJourney.experiences = [];
        journeyNode.getExperiencesRelationships().forEach((rel, idx) => {
            const poiNode = new PoiNode(
                queryResult.records[0].get("pois")[idx]
            );
            const poi = poiNode.getProperties();
            poi.location = PointToLocation(poi.location);
            createdJourney.experiences.push({
                experience: rel.properties as Experience,
                poi: poi
            });
        });
        createdJourney.start = PointToLocation(journeyNode.getStart());
        createdJourney.end = PointToLocation(journeyNode.getEnd());

        return createdJourney;
    }

    /**
     * updates a journey, first find journey and set appropriate fields that have to be
     * updated
     * @param user
     * @param journey
     * @returns
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

    async delete(user: string, journey: string) {
        const result = await this.journeyRepository.delete(user, journey);
        return result;
    }

    async addExperiences(
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterestDto;
        }[]
    ) {
        const queryResult = await this.journeyRepository.addExperiences(
            journey,
            experiences
        );
        const journeyNode = new JourneyNode(
            queryResult.records[0].get("journey"),
            queryResult.records[0].get("experiences")
        );
        const updatedJourney = journeyNode.getProperties() as JourneyDto;

        updatedJourney.experiences = [];
        journeyNode.getExperiencesRelationships().forEach((rel, idx) => {
            const poiNode = new PoiNode(
                queryResult.records[0].get("pois")[idx]
            );
            const poi = poiNode.getProperties();
            poi.location = PointToLocation(poi.location);
            updatedJourney.experiences.push({
                experience: rel.properties as Experience,
                poi: poi
            });
        });
        updatedJourney.start = PointToLocation(journeyNode.getStart());
        updatedJourney.end = PointToLocation(journeyNode.getEnd());

        return updatedJourney;
    }

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

    async getExperience(journey: string, poi: string) {
        const queryResult = await this.journeyRepository.getExperience(
            journey,
            poi
        );
        if (queryResult.records.length == 0)
            throw new NotFoundError("could not find experience");
        return queryResult.records[0].get("experience").properties;
    }

    async updateExperience(
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
            journey,
            poi,
            toUpdate
        );
        return queryResult.records[0].get("experience").properties;
    }
}
