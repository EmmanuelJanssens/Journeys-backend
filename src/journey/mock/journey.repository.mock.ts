import { Record, Node, Integer, Point } from "neo4j-driver";
import { Locality } from "src/utilities/Locality";
import { CreateJourneyDto } from "../dto/create-journey.dto";
import { Journey, JourneyNode } from "../entities/journey.entity";

export const mockJourney = (id: string) => {
    return {
        id: id,
        title: "title",
        description: "description",
        start: new Point(new Integer(4326), 0, 0),
        end: new Point(new Integer(4326), 0, 0),
        visibility: "public"
    };
};

export const mockJourneyWithExperience = (id: string) => {
    return {
        ...mockJourney(id),
        experiences: [
            {
                id: "test-id",
                title: "title",
                description: "description",
                date: "2020-01-01"
            }
        ]
    };
};

export class JourneyRepositoryMock {
    public get = jest.fn((journey: string): Promise<any> => {
        const record = new Record(
            ["journey", "count", "thumbnails", "creator"],
            [
                new Node(new Integer(1), ["Journey"], mockJourney(journey)),
                10,
                [["thumbnail"], []],
                "test-user"
            ],
            {
                journey: 0,
                count: 1,
                thumbnails: 2,
                creator: 3
            }
        );
        const res = {
            records: [record],
            summary: {}
        };
        return new Promise((resolve) => resolve(res));
    });
    public create = jest.fn(
        (user: string, journey: CreateJourneyDto): Promise<any> => {
            const record = new Record(
                ["journey", "creator"],
                [
                    new Node(new Integer(1), ["Journey"], <Journey>{
                        id: "created-journey-id",
                        description: journey.description,
                        title: journey.title,
                        start: new Point(
                            new Integer(4326),
                            (<Locality>journey.start).longitude,
                            (<Locality>journey.start).latitude
                        ),
                        end: new Point(
                            new Integer(4326),
                            (<Locality>journey.end).longitude,
                            (<Locality>journey.end).latitude
                        ),
                        visibility: journey.visibility
                    }),
                    user
                ],
                {
                    journey: 0,
                    creator: 1
                }
            );

            const res = {
                records: [record],
                summary: {}
            };
            return new Promise((resolve) => resolve(res));
        }
    );
    public update = jest.fn();
    public delete = jest.fn();
    public getExperiences = jest.fn();
}
