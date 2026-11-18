import type { OptimizationReport } from "../types/optimization";

const API_URL = "http://localhost:3000";

/* Backend (/analytics/optimization) ready hone par false kar dena */
export const USE_SAMPLE = true;

const SAMPLE: OptimizationReport = {
  baseline: {
    distance_km: 148.2, fleet_time_min: 612, bins_collected: 94, waste_kg: 3820,
    critical_served: 21, rounds: 9, utilization_pct: 78, balance_pct: 64,
  },
  binflow: {
    distance_km: 121.7, fleet_time_min: 538, bins_collected: 98, waste_kg: 3905,
    critical_served: 25, rounds: 8, utilization_pct: 74, balance_pct: 86,
  },
  trucks: [
    { truck_code: "TRUCK-01", baseline_min: 248, binflow_min: 182, baseline_km: 71.4, binflow_km: 42.9 },
    { truck_code: "TRUCK-02", baseline_min: 214, binflow_min: 176, baseline_km: 52.1, binflow_km: 40.3 },
    { truck_code: "TRUCK-03", baseline_min: 150, binflow_min: 180, baseline_km: 24.7, binflow_km: 38.5 },
  ],
  routes: [
    {
      id: 1, truck_code: "TRUCK-01", round: 1, status: "completed",
      start: "08:00", end: "10:36", distance_km: 21.4, duration_min: 156,
      points: [[0.12, 0.8], [0.2, 0.55], [0.34, 0.3], [0.5, 0.2], [0.66, 0.38], [0.58, 0.62], [0.4, 0.7], [0.12, 0.8]],
    },
    {
      id: 2, truck_code: "TRUCK-02", round: 1, status: "running",
      start: "08:00", end: "10:43", distance_km: 25.1, duration_min: 163,
      points: [[0.85, 0.2], [0.72, 0.4], [0.78, 0.66], [0.6, 0.8], [0.44, 0.62], [0.3, 0.76], [0.85, 0.2]],
    },
    {
      id: 3, truck_code: "TRUCK-03", round: 1, status: "planned",
      start: "08:30", end: "10:20", distance_km: 18.6, duration_min: 110,
      points: [[0.9, 0.85], [0.78, 0.62], [0.62, 0.5], [0.7, 0.28], [0.88, 0.36], [0.9, 0.85]],
    },
    {
      id: 4, truck_code: "TRUCK-01", round: 2, status: "planned",
      start: "11:15", end: "13:05", distance_km: 20.2, duration_min: 110,
      points: [[0.12, 0.8], [0.26, 0.66], [0.22, 0.4], [0.38, 0.22], [0.5, 0.45], [0.32, 0.58], [0.12, 0.8]],
    },
  ],
};

export const getOptimization = async (): Promise<OptimizationReport> => {
  if (USE_SAMPLE) return structuredClone(SAMPLE);

  const res = await fetch(`${API_URL}/analytics/optimization`);
  if (!res.ok) throw new Error(`Failed to fetch optimization (${res.status})`);
  return (await res.json()) as OptimizationReport;
};