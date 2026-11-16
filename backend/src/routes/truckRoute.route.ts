
import { Router, Request, Response } from "express";
import { generateTruckRoute } from "../services/truckRouteService";

const router = Router();

router.get("/truck", async (req: Request, res: Response) => {
    try {
        const rawLimit = req.query.limit;
        let limit = 10;

        if (rawLimit !== undefined) {
            limit = Number(rawLimit);

            if (
                !Number.isInteger(limit) ||
                limit <= 0 ||
                limit > 1000
            ) {
                res.status(400).json({
                    message: "Limit must be an integer between 1 and 1000"
                });
                return;
            }
        }

        const route = await generateTruckRoute(limit);

        res.status(200).json({
            message: "Truck route generated successfully",
            ...route
        });

    } catch (error) {
        console.error("Truck route error:", error);

        res.status(500).json({
            message: "Failed to generate truck route"
        });
    }
});

export default router;
