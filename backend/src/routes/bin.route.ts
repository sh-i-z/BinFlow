
import { Router, Request, Response } from "express";
import { binSchema, updateBinSchema } from "../schemas/bin.schema";
import { pool } from "../config/db";
import {
    getBinPriority,
    type BinPriority
} from "../utils/binPriority";

const router = Router();

// Database bin row type
type BinRow = {
    id: number | string;
    name: string;
    latitude: number;
    longitude: number;
    fill_level: number;
    created_at: Date | string;
};

type BinWithPriority = BinRow & {
    priority: BinPriority;
};

// 1. Register a new bin
router.post("/", async (req: Request, res: Response) => {
    const result = binSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid bin data",
            errors: result.error.flatten()
        });
    }

    try {
        const { name, latitude, longitude, fill_level } = result.data;

        const query = `
            INSERT INTO bins (name, latitude, longitude, fill_level)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [name, latitude, longitude, fill_level];

        const dbResult = await pool.query<BinRow>(query, values);

        return res.status(201).json({
            message: "Bin registered successfully",
            bin: dbResult.rows[0]
        });

    } catch (error) {
        console.error("Error registering bin:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// 2. Get all bins
router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await pool.query<BinRow>(
            "SELECT * FROM bins ORDER BY id ASC"
        );

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error fetching bins:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// 3. Get, filter and sort bins by priority
// Keep this before /:id
router.get("/priority", async (req: Request, res: Response) => {
    try {
        const { level, minFill } = req.query;

        const validPriorities: BinPriority[] = [
            "low",
            "medium",
            "high",
            "critical"
        ];

        // Validate priority level
        if (
            level !== undefined &&
            (
                typeof level !== "string" ||
                !validPriorities.includes(level as BinPriority)
            )
        ) {
            return res.status(400).json({
                message: "Invalid priority level"
            });
        }

        // Validate minimum fill level
        let minimumFill: number | undefined;

        if (minFill !== undefined) {
            minimumFill = Number(minFill);

            if (
                typeof minFill !== "string" ||
                minFill.trim() === "" ||
                !Number.isFinite(minimumFill) ||
                minimumFill < 0 ||
                minimumFill > 100
            ) {
                return res.status(400).json({
                    message: "minFill must be between 0 and 100"
                });
            }
        }

        // Fetch bins from database
        const result = await pool.query<BinRow>(
            "SELECT * FROM bins"
        );

        // Calculate priority for every bin
        let bins: BinWithPriority[] = result.rows.map((bin) => ({
            ...bin,
            priority: getBinPriority(bin.fill_level)
        }));

        // Filter by priority
        if (level) {
            bins = bins.filter(
                (bin) => bin.priority === level
            );
        }

        // Filter by minimum fill level
        if (minimumFill !== undefined) {
            bins = bins.filter(
                (bin) => bin.fill_level >= minimumFill!
            );
        }

        // Sort: Critical → High → Medium → Low
        const priorityOrder: Record<BinPriority, number> = {
            critical: 1,
            high: 2,
            medium: 3,
            low: 4
        };

        bins.sort(
            (a: BinWithPriority, b: BinWithPriority) =>
                priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        return res.status(200).json(bins);

    } catch (error) {
        console.error("Error fetching bin priorities:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// 4. Get a bin by ID
router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid bin ID"
        });
    }

    try {
        const result = await pool.query<BinRow>(
            "SELECT * FROM bins WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bin not found"
            });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching bin:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// 5. Update bin fill level
router.patch("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid bin ID"
        });
    }

    const result = updateBinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid fill level",
            errors: result.error.flatten()
        });
    }

    try {
        const dbResult = await pool.query<BinRow>(
            "UPDATE bins SET fill_level = $1 WHERE id = $2 RETURNING *",
            [result.data.fill_level, id]
        );

        if (dbResult.rows.length === 0) {
            return res.status(404).json({
                message: "Bin not found"
            });
        }

        return res.status(200).json({
            message: "Bin updated successfully",
            bin: dbResult.rows[0]
        });

    } catch (error) {
        console.error("Error updating bin:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// 6. Delete a bin
router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid bin ID"
        });
    }

    try {
        const result = await pool.query<BinRow>(
            "DELETE FROM bins WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Bin not found"
            });
        }

        return res.status(200).json({
            message: "Bin deleted successfully",
            bin: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting bin:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

export default router;
