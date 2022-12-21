import { Point, Integer } from "neo4j-driver";
import { Locality } from "./Locality";

export function PointToLocation(point: Point): Locality {
    return {
        latitude: point.y,
        longitude: point.x
    };
}
