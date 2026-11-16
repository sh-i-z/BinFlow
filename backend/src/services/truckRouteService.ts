
import { pool } from "../config/db";
import { getBinPriority } from "../utils/binPriority";
import { planRoute } from "./routePlanner";
import type { RouteBin } from "./routePlanner";

const DEPOT_LOCATION = {
    latitude: 28.6139,
    longitude: 77.2090
};

export const generateTruckRoute = async (
    maxStops: number = 10
) => {
    // Fetch bins from PostgreSQL
    const result = await pool.query(
        `SELECT id, name, latitude, longitude, fill_level
         FROM bins`
    );

    // Convert database records into RouteBin objects
    const bins: RouteBin[] = result.rows.map((bin) => ({
        id: Number(bin.id),
        name: bin.name,
        latitude: Number(bin.latitude),
        longitude: Number(bin.longitude),
        fill_level: Number(bin.fill_level),
        priority: getBinPriority(Number(bin.fill_level))
    }));

    // Generate optimized route
    const routeResult = planRoute(
        bins,
        DEPOT_LOCATION,
        maxStops
    );

    return {
        depot: DEPOT_LOCATION,
        ...routeResult
    };
};
