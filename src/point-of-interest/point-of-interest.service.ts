import { Injectable } from "@nestjs/common";
import { CreatePointOfInterestDto } from "./dto/create-point-of-interest.dto";
import { UpdatePointOfInterestDto } from "./dto/update-point-of-interest.dto";

@Injectable()
export class PointOfInterestService {
    create(createPointOfInterestDto: CreatePointOfInterestDto) {
        return "This action adds a new pointOfInterest";
    }

    findAll() {
        return `This action returns all pointOfInterest`;
    }

    findOne(id: number) {
        return `This action returns a #${id} pointOfInterest`;
    }

    update(id: number, updatePointOfInterestDto: UpdatePointOfInterestDto) {
        return `This action updates a #${id} pointOfInterest`;
    }

    remove(id: number) {
        return `This action removes a #${id} pointOfInterest`;
    }
}
