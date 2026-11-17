import type { Bin } from "../types/bin";
import type { TruckRoute } from "../types/route";

const API_URL = "http://localhost:3000";

const toBin = (b: unknown): Bin => {
    const r = b as Record<string, unknown>;
    return {
        id: Number(r.id),
        name: String(r.name),
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        fill_level: Number(r.fill_level),
        created_at: String(r.created_at ?? ""),
    };
};

export const getBins = async (): Promise<Bin[]> => {
    const response = await fetch(`${API_URL}/bins`);

    if (!response.ok) {
        throw new Error(`Failed to fetch bins (${response.status})`);
    }

    const json = await response.json();
    const raw: unknown[] = Array.isArray(json)
        ? json
        : json.bins ?? json.data ?? [];

    return raw.map(toBin);
};

export const collectBin = async (id: number): Promise<Bin> => {
    const response = await fetch(`${API_URL}/bins/${id}/collect`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(`Failed to collect bin (${response.status})`);
    }

    const json = await response.json();
    return toBin(json.bin);
};

export const getTruckRoute = async (limit: number = 10): Promise<TruckRoute> => {
    const response = await fetch(`${API_URL}/routes/truck?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch route (${response.status})`);
    }

    const json = await response.json();

    return {
        depot: {
            latitude: Number(json.depot.latitude),
            longitude: Number(json.depot.longitude),
        },
        totalStops: Number(json.totalStops),
        totalDistance: Number(json.totalDistance),
        route: (json.route as unknown[]).map((item) => {
            const x = item as Record<string, unknown>;
            return {
                id: Number(x.id),
                name: String(x.name),
                latitude: Number(x.latitude),
                longitude: Number(x.longitude),
                fill_level: Number(x.fill_level),
                priority: String(x.priority),
            };
        }),
    };
};