export type TruckStatus = "idle" | "active" | "maintenance";

export type AssignedBin = {
    id: number;
    name: string;
    fill_level: number;
    estimated_waste_kg: number;
};

export type FleetTruck = {
    id: number;
    truck_code: string;
    capacity_kg: number;
    depot_latitude: number;
    depot_longitude: number;
    shift_duration_minutes: number;
    status: TruckStatus;
    // plan / execution state (backend fleet plan se aayega)
    load_kg: number;
    shift_used_minutes: number;
    current_round: number;
    completed_rounds: number;
    assigned_bins: AssignedBin[];
};