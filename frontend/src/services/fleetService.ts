import type { FleetTruck } from "../types/fleet";

const API_URL = "http://localhost:3000";

/* Backend ready hone par false kar dena */
export const USE_SAMPLE = true;

const SAMPLE: FleetTruck[] = [
    {
        id: 1, truck_code: "TRUCK-01", capacity_kg: 1000,
        depot_latitude: 28.602, depot_longitude: 77.195,
        shift_duration_minutes: 480, status: "active",
        load_kg: 640, shift_used_minutes: 215, current_round: 2, completed_rounds: 1,
        assigned_bins: [
            { id: 12, name: "Bin 12", fill_level: 96, estimated_waste_kg: 58 },
            { id: 31, name: "Bin 31", fill_level: 88, estimated_waste_kg: 44 },
            { id: 47, name: "Bin 47", fill_level: 73, estimated_waste_kg: 36 },
            { id: 52, name: "Bin 52", fill_level: 65, estimated_waste_kg: 31 },
            { id: 64, name: "Bin 64", fill_level: 62, estimated_waste_kg: 28 },
        ],
    },
    {
        id: 2, truck_code: "TRUCK-02", capacity_kg: 1000,
        depot_latitude: 28.634, depot_longitude: 77.225,
        shift_duration_minutes: 480, status: "active",
        load_kg: 930, shift_used_minutes: 402, current_round: 3, completed_rounds: 2,
        assigned_bins: [
            { id: 8, name: "Bin 8", fill_level: 100, estimated_waste_kg: 62 },
            { id: 23, name: "Bin 23", fill_level: 91, estimated_waste_kg: 50 },
            { id: 77, name: "Bin 77", fill_level: 84, estimated_waste_kg: 41 },
        ],
    },
    {
        id: 3, truck_code: "TRUCK-03", capacity_kg: 1000,
        depot_latitude: 28.61, depot_longitude: 77.23,
        shift_duration_minutes: 480, status: "idle",
        load_kg: 0, shift_used_minutes: 0, current_round: 0, completed_rounds: 0,
        assigned_bins: [],
    },
];

export const getTrucks = async (): Promise<FleetTruck[]> => {
    if (USE_SAMPLE) return structuredClone(SAMPLE);

    const res = await fetch(`${API_URL}/fleet/trucks`);
    if (!res.ok) throw new Error(`Failed to fetch trucks (${res.status})`);
    const json = await res.json();
    const raw: Record<string, unknown>[] = Array.isArray(json) ? json : json.trucks ?? [];

    return raw.map((t) => ({
        id: Number(t.id),
        truck_code: String(t.truck_code),
        capacity_kg: Number(t.capacity_kg),
        depot_latitude: Number(t.depot_latitude),
        depot_longitude: Number(t.depot_longitude),
        shift_duration_minutes: Number(t.shift_duration_minutes),
        status: (t.status as FleetTruck["status"]) ?? "idle",
        load_kg: Number(t.load_kg ?? 0),
        shift_used_minutes: Number(t.shift_used_minutes ?? 0),
        current_round: Number(t.current_round ?? 0),
        completed_rounds: Number(t.completed_rounds ?? 0),
        assigned_bins: ((t.assigned_bins as Record<string, unknown>[]) ?? []).map((b) => ({
            id: Number(b.id),
            name: String(b.name),
            fill_level: Number(b.fill_level),
            estimated_waste_kg: Number(b.estimated_waste_kg),
        })),
    }));
};