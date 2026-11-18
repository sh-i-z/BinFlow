
export type TruckStatus =
    | "available"
    | "active"
    | "maintenance";

export interface Truck {
    id: number;
    truck_code: string;
    capacity_kg: number;

    depot_latitude: number;
    depot_longitude: number;

    shift_duration_minutes: number;
    status: TruckStatus;

    created_at: string;
    updated_at: string;
}
