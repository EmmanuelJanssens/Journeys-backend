import { Injectable } from "@nestjs/common";
import { PointToLocation } from "../entities/utilities";
import { UserPrivateError } from "../errors/Errors";
import { JourneyDto } from "../journey/dto/journey.dto";
import { JourneyNode } from "../journey/entities/journey.entity";
import { Integer } from "neo4j-driver";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { PoiNode } from "../point-of-interest/entities/point-of-interest.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserDto } from "./dto/user-dto";
import { UserNode } from "./entities/user.entity";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    /**
     * Create a new user
     * @param user the data of the user
     * @param uid the id of the user
     * @returns a UserDto
     */
    async create(user: CreateUserDto, uid: string) {
        const queryResult = await this.userRepository.create(user, uid);
        const userNode = new UserNode(
            queryResult.records[0].get("user"),
            [],
            []
        );
        const createdUser = userNode.getProperties() as UserDto;

        return createdUser;
    }

    /**
     * Find a user by its id
     * @param uid the id of the user
     * @returns a UserDto
     */
    async findOne(uid: string) {
        const queryResult = await this.userRepository.findOne(uid);
        const records = queryResult.records[0];
        const userNode = new UserNode(records.get("user"), [], []);
        const foundUser = userNode.getProperties() as UserDto;
        if (foundUser.visibility == "private")
            throw new UserPrivateError("User profile is private");
        foundUser.journeysAggregate = {
            count: records.get("journeys").low
        };
        foundUser.poisAggregate = {
            count: records.get("pois").low
        };
        return foundUser;
    }

    async updateUser(uid: string, user: UpdateUserDto) {
        const queryResult = await this.userRepository.update(uid, user);
        const userNode = new UserNode(
            queryResult.records[0].get("user"),
            [],
            []
        );
        const updatedUser = userNode.getProperties() as UserDto;
        return updatedUser;
    }
    /**
     * Find a user by its uid
     * @param uid the uid of the user
     * @returns a UserDto
     * */
    async getJourneys(uid: string, skip: Integer, limit: Integer) {
        const queryResult = await this.userRepository.getJourneys(
            uid,
            skip,
            limit
        );
        const userJourneys: JourneyDto[] = [];
        queryResult.records.forEach((record) => {
            const userNode = new UserNode(record.get("user"), [], []);
            if (userNode.getVisibility() == "private")
                throw new UserPrivateError("User profile is private");
            const journeyNode = new JourneyNode(record.get("journey"), []);
            if (journeyNode.getVisibility() == "public") {
                const journey = journeyNode.getProperties() as JourneyDto;
                journey.start = PointToLocation(journeyNode.getStart());
                journey.end = PointToLocation(journeyNode.getEnd());
                journey.creator = userNode.getUsername();
                journey.experiencesAggregate = {
                    count: record.get("expCount").low
                };
                userJourneys.push(journey);
            }
        });
        return userJourneys;
    }

    /**
     * get the journeys of the current user
     * @param uid uid of the user
     * @param skip skip the first n journeys
     * @param limit limit the number of journeys
     * @returns an array of JourneyDto
     */
    async getMyJourneys(uid: string, skip: Integer, limit: Integer) {
        const queryResult = await this.userRepository.getJourneys(
            uid,
            skip,
            limit
        );
        const userJourneys: JourneyDto[] = [];
        queryResult.records.forEach((record) => {
            if (record.get("journey") != null) {
                const userNode = new UserNode(record.get("user"), [], []);
                const journeyNode = new JourneyNode(record.get("journey"), []);
                const journey = journeyNode.getProperties() as JourneyDto;
                journey.start = PointToLocation(journeyNode.getStart());
                journey.end = PointToLocation(journeyNode.getEnd());
                journey.creator = userNode.getUsername();
                const thumbnails = record.get("thumbnails") as string[][];
                journey.thumbnails = thumbnails.reduce(
                    (acc, curr) => acc.concat(curr),
                    []
                );
                journey.experiencesAggregate = {
                    count: record.get("expCount").low
                };
                userJourneys.push(journey);
            }
        });
        return userJourneys;
    }

    async getMyProfile(uid: string) {
        const queryResult = await this.userRepository.findOne(uid);
        const records = queryResult.records[0];
        const userNode = new UserNode(records.get("user"), [], []);
        const foundUser = userNode.getProperties() as UserDto;
        foundUser.journeysAggregate = {
            count: records.get("journeys").low
        };
        foundUser.poisAggregate = {
            count: records.get("pois").low
        };
        foundUser.experiencesAggregate = {
            count: records.get("exps").low
        };
        return foundUser;
    }

    /**
     * get the pois of the current user
     * @param uid uid of the user
     * @param skip skip the first n pois
     * @param limit limit the number of pois
     * @returns an array of PointOfInterestDto
     */
    async getPois(uid: string, skip: Integer, limit: Integer) {
        const queryResult = await this.userRepository.getPois(uid, skip, limit);
        const userPois: PointOfInterestDto[] = [];
        queryResult.records.forEach((record) => {
            if (record.get("poi")) {
                const poiNode = new PoiNode(record.get("poi"), []);
                if (poiNode != null) {
                    const poi = poiNode.getProperties() as PointOfInterestDto;
                    poi.location = PointToLocation(poiNode.getLocation());
                    poi.experiencesAggregate = {
                        count: record.get("expCount").low
                    };
                    userPois.push(poi);
                }
            }
        });
        return userPois;
    }
    async getMyPois(uid: string, skip: Integer, limit: Integer) {
        const queryResult = await this.userRepository.getPois(uid, skip, limit);
        const userPois: PointOfInterestDto[] = [];
        queryResult.records.forEach((record) => {
            if (record.get("poi")) {
                const poiNode = new PoiNode(record.get("poi"), []);
                if (poiNode != null) {
                    const poi = poiNode.getProperties() as PointOfInterestDto;
                    poi.location = PointToLocation(poiNode.getLocation());
                    poi.experiencesAggregate = {
                        count: record.get("expCount").low
                    };
                    userPois.push(poi);
                }
            }
        });
        return userPois;
    }
}
