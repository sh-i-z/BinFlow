// One limitation: This is our initial heuristic. We'll tune the weights after evaluating routes; it does not guarantee an optimal route.


import type { DispatchBin } from "../utils/dispatchComparator";
import { calculateDistance } from "../utils/distance";

export interface RouteBin extends DispatchBin {
    latitude: number;
    longitude: number;
}

export interface Location {
    latitude: number;
    longitude: number;
}

const getUrgencyScore = (priority: DispatchBin["priority"]): number => {
    const scores = {
        critical: 1,
        high: 0.75,
        medium: 0.5,
        low: 0.25
    };

    return scores[priority];
};

const getProximityScore = (distance: number): number => {
    return 1 / (1 + distance);
};

export const planRoute = (
    bins: RouteBin[],
    startLocation: Location,
    maxStops: number = 10
) => {
    const remainingBins = [...bins];
    const route: RouteBin[] = [];

    let currentLocation = startLocation;
    let totalDistance = 0;

    while (remainingBins.length > 0 && route.length < maxStops) {
        let bestIndex = 0;
        let bestScore = -Infinity;
        let bestDistance = 0;

        for (let i = 0; i < remainingBins.length; i++) {
            const bin = remainingBins[i];

            const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                bin.latitude,
                bin.longitude
            );

            const urgency = getUrgencyScore(bin.priority);
            const proximity = getProximityScore(distance);

            const score = bin.fill_level >= 95
                ? 2 + proximity
                : 0.7 * urgency + 0.3 * proximity;

            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
                bestDistance = distance;
            }
        }

        const selectedBin = remainingBins.splice(bestIndex, 1)[0];

        route.push(selectedBin);
        totalDistance += bestDistance;

        currentLocation = {
            latitude: selectedBin.latitude,
            longitude: selectedBin.longitude
        };
    }

    return {
        totalStops: route.length,
        totalDistance: Number(totalDistance.toFixed(3)),
        route
    };
};
