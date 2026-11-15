
import { Router, Request, Response } from "express";
import { binSchema } from "../schemas/bin.schema";

const router = Router();

// Temporary storage (we'll replace this with PostgreSQL)
interface Bin {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    fill_level: number;
    created_at: string;
}

const bins: Bin[] = [];

// Register a new bin
router.post("/", (req: Request, res: Response) => {

    const result = binSchema.safeParse(req.body);
    //safeParse()	Validates incoming data using Zod

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid bin data",
            errors: result.error.flatten()
        });
    }

    const newBin: Bin = {
        id: bins.length + 1,
        ...result.data,
        created_at: new Date().toISOString()
    };

    bins.push(newBin);

    return res.status(201).json({
        message: "Bin registered successfully",
        bin: newBin
    });
});

// Get all bins
router.get("/", (req: Request, res: Response) => {
    return res.status(200).json(bins);
});

export default router;

