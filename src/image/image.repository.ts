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
                        thumbnail: file,
                        isActive: true,
                        createdAt: datetime(),
                        updatedAt: datetime()
                    })
                    MERGE (image)<-[:HAS_IMAGE]-(experience)
                    RETURN image
                ",
                "RETURN [] as images",
                {experienceId: $experienceId, imageFiles: coalesce($imageFiles,[])}
            ) YIELD value
            MATCH (expToUpdt: Experience{id:$experienceId})-[:HAS_IMAGE]->(img:Image)

            RETURN collect(DISTINCT img) as images
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
            OPTIONAL MATCH (journey:Journey{id: $journeyId})-[r:HAS_IMAGE]->(thumbnail:Image)
            DELETE r
            WITH r
            MATCH (jou:Journey{id: $journeyId, isActive: true})
            MATCH (image:Image{id: $imageId, isActive: true})
            MERGE (image)<-[:HAS_IMAGE]-(jou)
            RETURN image as thumbnail
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
            MATCH (image:Image{id: $imageId,isActive:true}) <- [ img: HAS_IMAGE ] - (journey:Journey{id: $journeyId,isActive:true})
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
            MATCH (experience:Experience{id: $experienceId, isActive: true})
            WITH experience
            CALL apoc.do.when(
                size($imageIds) > 0,
                "
                    UNWIND $imageIds AS imageId
                        MATCH (image:Image{id: imageId, isActive: true})
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
            MATCH (experience:Experience{id: $experienceId, isActive: true})
            WITH experience
            CALL apoc.do.when(
                size($imageIds) > 0,
                "
                    UNWIND imageIds AS imageId
                        MATCH (image:Image{id: imageId,isActive: true})<-[:HAS_IMAGE]-(experience)
                        SET image.isActive = false
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

    /**
     * Updates an image file url usually
     * after uploading to a CDN or bucket
     * @param id id of the imabe
     * @param url url of the original image
     * @param thumbnail url of the thumbnail image
     * @returns
     */
    async setImageFileUrl(
        id: string,
        userId: string,
        image: {
            original: string;
            thumbnail: string;
        }
    ) {
        const query = `
            MATCH (image: Image {id: $id,isActive:true})<-[*0..3]-(:User{uid: $userId})
            SET image.original = $image.original,
                image.thumbnail = $image.thumbnail
            RETURN image
        `;
        const params = { id, image, userId };
        return this.neo4jService.write(query, params);
    }
}
