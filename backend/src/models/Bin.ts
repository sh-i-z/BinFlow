
export interface Bin {
    id: number;
    name: string;

    latitude: number;
    longitude: number;

    fill_level: number;

    max_waste_capacity_kg: number;
    estimated_waste_kg: number;

    created_at: string;
}

export interface BinWithPriority extends Bin {
    priority: "low" | "medium" | "high" | "critical";
}
