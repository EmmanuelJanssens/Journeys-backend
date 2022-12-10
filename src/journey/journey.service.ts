import { Injectable } from "@nestjs/common";
import { Neo4jService } from "neo4j/neo4j.service";
import { JourneyRepository } from "./journey.repository";
import { Journey } from "./entities/journey.entity";
import { Experience } from "entities/experience.entity";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { PointOfInterest } from "point-of-interest/entities/point-of-interest.entity";
import { UpdateJourneyDto } from "./dto/update-journey.dto";
import { JourneyDto } from "./dto/journey.dto";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";

@Injectable()
export class JourneyService {
    constructor(private journeyRepository: JourneyRepository) {}

    getRepository() {
        return this.journeyRepository;
    }
    transformPos(journey: any): JourneyDto {
        journey.start = {
            latitude: journey.start.x,
            longitude: journey.start.y
        };

        journey.end = {
            latitude: journey.end.x,
            longitude: journey.end.y
        };

        return journey;
    }

    async findOne(id: string) {
        const result = await this.journeyRepository.get(id);

        return this.transformPos(result);
    }

    async create(user: string, createJourney: CreateJourneyDto) {
        const result = await this.journeyRepository.create(user, createJourney);
        return this.transformPos(result);
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

        const result = await this.journeyRepository.update(user, journey);
        return this.transformPos(result);
    }

    async delete(user: string, journey: string) {
        const result = await this.journeyRepository.delete(user, journey);
        return result;
    }

    async getExperiences(user: string, journey: string) {
        const result = await this.journeyRepository.getExperiences(journey);
        return this.transformPos(result);
    }

    async getExperience(journey: string, poi: string) {
        const result = await this.journeyRepository.getExperience(journey, poi);
        return result;
    }

    async addExperience(
        user: string,
        journey: string,
        poi: string,
        experience: Experience
    ) {
        const result = await this.journeyRepository.addExperience(
            user,
            journey,
            poi,
            experience
        );
        delete result.images;
        return result;
    }

    async addExperiences(
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterestDto;
        }[]
    ) {
        const result = await this.journeyRepository.addExperiences(
            journey,
            experiences
        );
        return this.transformPos(result);
    }
}
