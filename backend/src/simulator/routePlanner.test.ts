
import { planRoute, type RouteBin } from "../services/routePlanner";

const bins: RouteBin[] = [
    {
        id: 1,
        name: "Bin A",
        fill_level: 90,
        priority: "critical",
        latitude: 28.6140,
        longitude: 77.2100
    },
    {
        id: 2,
        name: "Bin B",
        fill_level: 70,
        priority: "high",
        latitude: 28.6200,
        longitude: 77.2200
    },
    {
        id: 3,
        name: "Bin C",
        fill_level: 98,
        priority: "critical",
        latitude: 28.6145,
        longitude: 77.2105
    },
    {
        id: 4,
        name: "Bin D",
        fill_level: 50,
        priority: "medium",
        latitude: 28.6300,
        longitude: 77.2300
    }
];

const startLocation = {
    latitude: 28.6139,
    longitude: 77.2090
};

const result = planRoute(bins, startLocation, 3);

console.log("Total stops:", result.totalStops);
console.log("Total distance:", result.totalDistance, "km");
console.log(
    "Route:",
    result.route.map((bin) => bin.name)
);
