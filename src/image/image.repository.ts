import { Injectable } from "@nestjs/common";
import { ManagedTransaction, QueryResult, Transaction } from "neo4j-driver";
import { Neo4jService } from "../neo4j/neo4j.service";

@Injectable()
export class ImageRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Connect an image to an experience
     * @param experienceId id of the experience to wich to attach
     * @param imageFile file location on the CDN or bucket
     */
    async createAndConnectImageToExperience(
        tx: ManagedTransaction | Transaction,
        experienceId: string,
        imageFiles: string[]
    ): Promise<QueryResult> {
        const query = `
            CALL apoc.do.when(
                size($imageFiles) > 0,
                "
                    MATCH (experience:Experience{id: experienceId})<-[:CREATED|EXPERIENCE*0..2]-(user:User)
                    WITH experience
                    UNWIND $imageFiles AS file
                    CREATE (image:Image {
                        id: apoc.create.uuid(),
                        original: file,
                        thumbnail: file+'_thumb'
                    })
                    MERGE (image)<-[:HAS_IMAGE]-(experience)
                    RETURN image
                ",
                "RETURN [] AS images",
                {experienceId: $experienceId, imageFiles: coalesce($imageFiles,[])}
            ) YIELD value
            RETURN value.image as image
        `;
        const params = { experienceId, imageFiles: imageFiles || [] };

        return tx.run(query, params);
    }

    /**
     * connect image to a journey as a thumbnail
     * @param tx
     * @param journeyId
     * @param imageId
     * @returns
     */
    async connectImageToJourney(
        tx: ManagedTransaction,
        journeyId: string,
        imageId: string
    ) {
        const query = `
            MATCH (journey:Journey{id: $journeyId})
            WITH journey
            MATCH (image:Image{id: $imageId})
            MERGE (image)<-[:HAS_IMAGE]-(journey)
            RETURN image
        `;
        const params = { journeyId, imageId };
        return tx.run(query, params);
    }

    async disconnectImageFromJourney(
        tx: ManagedTransaction,
        journeyId: string,
        imageId: string
    ) {
        const query = `
            MATCH (image:Image{id: $imageId}) <- [ img: HAS_IMAGE ] - (journey:Journey{id: $journeyId})
            DELETE img
            WITH imgage
            RETURN image
        `;
        const params = { journeyId, imageId };
        return tx.run(query, params);
    }

    /**
     * Connect multiple images to an experience
     * this function has to run in a transaction because
     * it will always be part of a bigger transaction eg. creating a journey with experiences
     * @param experienceId id of the experience to wich to attach
     * @param imageIds ids of the images to attach
     * @returns
     */
    async connectImagesToExperience(
        tx: ManagedTransaction,
        experienceId: string,
        imageIds: string[]
    ) {
        const query = `
            MATCH (experience:Experience{id: $experienceId})
            WITH experience
            CALL apoc.do.when(
                size($imageIds) > 0,
                "
                    UNWIND $imageIds AS imageId
                        MATCH (image:Image{id: imageId})
                        MERGE (image)<-[:HAS_IMAGE]-(experience)
                    RETURN collect(image) as images
                ",
                "RETURN []",
                {experience: experience, imageIds: $imageIds}
            ) YIELD value
            RETURN value.images as images
        `;
        const params = { experienceId, imageIds: imageIds || [] };
        return tx.run(query, params);
    }

    async disconnectImagesFromExperience(
        tx: ManagedTransaction | Transaction,
        experienceId: string,
        imageIds: string[]
    ) {
        const query = `
            MATCH (experience:Experience{id: $experienceId})
            WITH experience
            CALL apoc.do.when(
                size($imageIds) > 0,
                "
                    UNWIND $imageIds AS imageId
                        MATCH (image:Image{id: imageId})<-[:HAS_IMAGE]-(experience)
                        DETACH DELETE image
                        WITH imageId
                        RETURN collect(imageId) as deleted
                ",
                "RETURN []",
                {experience: experience, imageIds: $imageIds}
            ) YIELD value
            RETURN value.deleted as deleted
        `;
        const params = { experienceId, imageIds };
        return tx.run(query, params);
    }
}
