
import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { generateCityBins } from "../simulator/cityGenerator";
import { simulateFillLevel } from "../simulator/fillSimulator";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
    const count = req.body.count ?? 100;

    if (
        !Number.isInteger(count) ||
        count <= 0 ||
        count > 1000
    ) {
        return res.status(400).json({
            message: "Count must be an integer between 1 and 1000"
        });
    }

    const bins = generateCityBins(count);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const query = `
            INSERT INTO bins (name, latitude, longitude, fill_level)
            VALUES ${bins.map((_, i) => {
            const p = i * 4;
            return `($${p + 1}, $${p + 2}, $${p + 3}, $${p + 4})`;
        }).join(", ")}
            RETURNING *
        `;

        const values = bins.flatMap(bin => [
            bin.name,
            bin.latitude,
            bin.longitude,
            bin.fill_level
        ]);

        const result = await client.query(query, values);

        await client.query("COMMIT");

        return res.status(201).json({
            message: "City bins generated successfully",
            count: result.rows.length,
            bins: result.rows
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error generating city bins:", error);

        return res.status(500).json({
            message: "Failed to generate city bins"
        });

    } finally {
        client.release();
    }
});


// Simulate waste generation for all bins
router.post("/simulate", async (req: Request, res: Response) => {
    const wasteRate = req.body.wasteRate ?? 5;

    if (
        typeof wasteRate !== "number" ||
        !Number.isFinite(wasteRate) ||
        wasteRate < 0 ||
        wasteRate > 100
    ) {
        return res.status(400).json({
            message: "wasteRate must be a number between 0 and 100"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Fetch all existing bins
        const result = await client.query(
            "SELECT * FROM bins ORDER BY id ASC"
        );

        const updatedBins = [];

        // Calculate and update each bin
        for (const bin of result.rows) {
            const newFillLevel = simulateFillLevel(
                bin.fill_level,
                wasteRate
            );

            const updated = await client.query(
                `UPDATE bins
                 SET fill_level = $1
                 WHERE id = $2
                 RETURNING *`,
                [newFillLevel, bin.id]
            );

            updatedBins.push(updated.rows[0]);
        }

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Simulation completed successfully",
            updatedCount: updatedBins.length,
            bins: updatedBins
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Simulation error:", error);

        return res.status(500).json({
            message: "Simulation failed"
        });

    } finally {
        client.release();
    }
});


export default router;
