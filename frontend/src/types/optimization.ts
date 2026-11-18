export type PlanMetrics = {
    distance_km: number;
    fleet_time_min: number;
    bins_collected: number;
    waste_kg: number;
    critical_served: number;
    rounds: number;
    utilization_pct: number;
    balance_pct: number;
};

export type TruckCompare = {
    truck_code: string;
    baseline_min: number;
    binflow_min: number;
    baseline_km: number;
    binflow_km: number;
};

export type PlannedRoute = {
    id: number;
    truck_code: string;
    round: number;
    status: "planned" | "running" | "completed";
    start: string;
    end: string;
    distance_km: number;
    duration_min: number;
    points: [number, number][];
};

export type OptimizationReport = {
    baseline: PlanMetrics;
    binflow: PlanMetrics;
    trucks: TruckCompare[];
    routes: PlannedRoute[];
};