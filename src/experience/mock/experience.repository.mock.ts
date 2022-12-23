import {
    Integer,
    ManagedTransaction,
    Node,
    Point,
    Record,
    Transaction
} from "neo4j-driver";
import { CreateExperienceDto } from "../dto/create-experience.dto";

export class ExperienceRepositoryMock {
    async create(
        tx: ManagedTransaction | Transaction,
        userId: string,
        experience: CreateExperienceDto,
        journeyId: string
    ) {
        const record = new Record(
            ["experience", "poi"],
            [
                new Node(new Integer(1), ["Experience"], {
                    id: "test-id",
                    title: experience.title,
                    description: experience.description,
                    date: experience.date
                }),
                new Node(new Integer(2), ["POI"], {
                    id: experience.poi,
                    name: "name",
                    description: "description",
                    location: new Point(new Integer(4326), 0, 0)
                })
            ],
            {
                experience: 0,
                poi: 1
            }
        );
        const res = {
            records: [record],
            summary: {}
        };
        return new Promise((resolve) => resolve(res));
    }
}
