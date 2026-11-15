
import { Router, Request, Response } from "express";
import { binSchema, updateBinSchema } from "../schemas/bin.schema";
import { pool } from "../config/db";

const router = Router();

// Register a new bin
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

        const dbResult = await pool.query(query, values);

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

// Get all bins
router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
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

// Get a bin by ID
router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid bin ID"
        });
    }

    try {
        const result = await pool.query(
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
        const dbResult = await pool.query(
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

// Delete a bin
router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid bin ID"
        });
    }

    try {
        const result = await pool.query(
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
