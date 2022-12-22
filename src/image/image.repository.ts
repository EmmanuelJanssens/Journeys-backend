import { Injectable } from "@nestjs/common";
import { QueryResult } from "neo4j-driver";
import { Neo4jService } from "nest-neo4j/dist";

@Injectable()
export class ImageRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Connect an image to an experience
     * @param experienceId id of the experience to wich to attach
     * @param imageFile file location on the CDN or bucket
     */
    async createImage(
        experienceId: string,
        imageFile: string
    ): Promise<QueryResult> {
        const query = `
            CREATE (image:Image {
                id: apoc.create.uuid(),
                original: $imageFile,
                thumbnail: $imageFile+"_thumb"
            })
            WITH image
            MATCH (experience:Experience{id: $experienceId})
            MERGE (image)<-[:HAS_IMAGE]-(experience)
            RETURN image
        `;
        const params = { experienceId, imageFile };

        return this.neo4jService.write(query, params);
    }
}
