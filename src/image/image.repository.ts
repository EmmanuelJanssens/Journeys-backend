import { Injectable } from "@nestjs/common";
import { ManagedTransaction, QueryResult } from "neo4j-driver";
import { ExperienceNode } from "../experience/entities/experience.entity";
import { Neo4jService } from "../neo4j/neo4j.service";
import { ImageNode } from "./entities/image.entity";

@Injectable()
export class ImageRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    async createAndConnectToExperience(
        experienceId: string,
        addedImages: string[],
        transaction?: ManagedTransaction
    ) {
        const query = `
            CALL apoc.do.when(
                size($addedImages) > 0,
                "
                    MATCH (experience: Experience{id:$experienceId})<-[:CREATED|EXPERIENCE*0..2]-(user:User)
                    UNWIND $addedImages AS file
                    CREATE (image:Image {
                        id: apoc.create.uuid(),
                        url: file,
                        thumbnail: file,
                        isActive: true,
                        createdAt: datetime(),
                        updatedAt: datetime()
                    })
                    MERGE (image)<-[:HAS_IMAGE]-(experience)
                    RETURN image
                ",
                "RETURN [] as images",
                {experienceId: $experienceId, addedImages: $addedImages}
            ) YIELD value
            MATCH (image:Image{isActive:true})<-[:HAS_IMAGE]-(experience: Experience{id:$experienceId})<-[:CREATED|EXPERIENCE*0..2]-(user:User)
            RETURN DISTINCT image
        `;
        const params = { experienceId, addedImages };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }
        if (result.records.length === 0) return { createdImages: [] };
        return {
            createdImages: result.records.map(
                (record) => new ImageNode(record.get("image"))
            )
        };
    }
    /**
     * Connect an image to an experience
     * @param experienceId id of the experience to wich to attach
     * @param imageFile file location on the CDN or bucket
     */
    async unwindImagesToRelationships(
        experienceId: string,
        transaction?: ManagedTransaction
    ) {
        const query = `
            MATCH (connectTo: Experience{id:$experienceId})<-[:CREATED|EXPERIENCE*0..2]-(user:User)
            WITH connectTo, user
            CALL apoc.do.when(
                size(connectTo.addedImages) > 0,
                "
                    MATCH (experience: Experience{id:$experienceId})<-[:CREATED|EXPERIENCE*0..2]-(user:User)
                    UNWIND $imageFiles AS file
                    CREATE (image:Image {
                        id: apoc.create.uuid(),
                        url: file,
                        thumbnail: file,
                        isActive: true,
                        createdAt: datetime(),
                        updatedAt: datetime()
                    })
                    MERGE (image)<-[:HAS_IMAGE]-(experience)
                    RETURN image, experience
                ",
                "RETURN [] as images",
                {experienceId: $experienceId, imageFiles: connectTo.addedImages}
            ) YIELD value
            REMOVE connectTo.addedImages
            RETURN value.experience as experience, collect(DISTINCT value.image) as images
        `;
        const params = { experienceId };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            createdImages: <ImageNode[]>(
                result.records[0]
                    .get("images")
                    .map((image) => new ImageNode(image))
            )
        };
    }

    /**
     * connect image to a journey as a thumbnail
     * @param tx
     * @param journeyId
     * @param imageId
     * @returns
     */
    async connectImageToJourney(
        journeyId: string,
        imageId: string,
        transaction?: ManagedTransaction
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
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            thumbnail: new ImageNode(result.records[0].get("thumbnail"))
        };
    }

    async disconnectImageFromJourney(
        journeyId: string,
        imageId: string,
        transaction?: ManagedTransaction
    ) {
        const query = `
            MATCH (image:Image{id: $imageId,isActive:true}) <- [ img: HAS_IMAGE ] - (journey:Journey{id: $journeyId,isActive:true})
            DELETE img
            WITH imgage
            RETURN image
        `;
        const params = { journeyId, imageId };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            removed: new ImageNode(result.records[0].get("image"))
        };
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
        experienceId: string,
        transaction?: ManagedTransaction
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
        const params = { experienceId };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            images: <ImageNode[]>(
                result.records[0]
                    .get("images")
                    .map((image) => new ImageNode(image))
            )
        };
    }

    async disconnectImagesFromExperience(
        experienceId: string,
        imageIds: string[],
        transaction?: ManagedTransaction
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
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }
        return {
            deleted: result.records[0].get("deleted")
        };
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
            url: string;
            thumbnail: string;
        },
        transaction?: ManagedTransaction
    ) {
        const query = `
            MATCH (image: Image {id: $id,isActive:true})<-[*0..3]-(:User{uid: $userId})
            SET image.url = $image.url,
                image.thumbnail = $image.thumbnail
            RETURN image
        `;
        const params = { id, image, userId };
        let result: QueryResult;
        if (transaction) {
            result = await transaction.run(query, params);
        } else {
            result = await this.neo4jService.write(query, params);
        }

        return {
            image: new ImageNode(result.records[0].get("image"))
        };
    }
}
