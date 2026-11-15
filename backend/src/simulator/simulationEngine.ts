
import { pool } from "../config/db";
import { simulateFillLevel } from "./fillSimulator";

let simulationTimer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

export const runSimulationTick = async (
    wasteRate: number = 5
): Promise<void> => {
    // Prevent overlapping simulation ticks
    if (isRunning) return;

    isRunning = true;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            "SELECT id, fill_level FROM bins ORDER BY id ASC"
        );

        for (const bin of result.rows) {
            const newFillLevel = simulateFillLevel(
                bin.fill_level,
                wasteRate
            );

            await client.query(
                "UPDATE bins SET fill_level = $1 WHERE id = $2",
                [newFillLevel, bin.id]
            );
        }

        await client.query("COMMIT");

        console.log(
            `Simulation tick completed. Updated ${result.rows.length} bins.`
        );

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Simulation tick failed:", error);

    } finally {
        client.release();
        isRunning = false;
    }
};

// Start automatic simulation
export const startSimulation = (
    intervalMs: number = 5000,
    wasteRate: number = 5
): void => {
    if (simulationTimer !== null) {
        console.log("Simulation is already running.");
        return;
    }

    console.log("Automatic simulation started.");

    simulationTimer = setInterval(() => {
        void runSimulationTick(wasteRate);
    }, intervalMs);
};

// Stop automatic simulation
export const stopSimulation = (): void => {
    if (simulationTimer !== null) {
        clearInterval(simulationTimer);
        simulationTimer = null;

        console.log("Automatic simulation stopped.");
    }
};
