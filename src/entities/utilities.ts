import { Point } from "neo4j-driver";

export function PointToLocation(point: Point): {
    latitude: number;
    longitude: number;
} {
    return {
        latitude: point.y,
        longitude: point.x
    };
}
