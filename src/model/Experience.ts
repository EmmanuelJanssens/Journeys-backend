import { ApiProperty } from "@nestjs/swagger";

export class Experience {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    images: string[];

    @ApiProperty()
    date: string;
}
