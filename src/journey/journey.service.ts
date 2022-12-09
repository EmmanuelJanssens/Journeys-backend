import { Injectable } from "@nestjs/common";
import { Neo4jService } from "src/neo4j/neo4j.service";
import { JourneyRepository } from "./journey.repository";
import { Journey } from "./entities/journey.entity";
import { Experience } from "src/entities/experience.entity";
import { CreateJourneyDto } from "./dto/create-journey.dto";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";

@Injectable()
export class JourneyService {
    private journeyRepository: JourneyRepository;

    constructor(private readonly neo4jService: Neo4jService) {
        this.journeyRepository = new JourneyRepository(this.neo4jService);
    }

    private transformPos(journey: any): Journey {
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

    async update(user: string, journey: Journey) {
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

        return result;
    }

    async addExperiences(
        journey: string,
        experiences: {
            experience: Experience;
            poi: PointOfInterest;
        }[]
    ) {
        const result = await this.journeyRepository.addExperiences(
            journey,
            experiences
        );
        return this.transformPos(result);
    }
}
