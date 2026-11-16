
import { Router, Request, Response } from "express";
import { getDispatchQueue } from "../services/dispatchService";

const router = Router();


router.get("/", async (req: Request, res: Response) => {
    try {
        const rawLimit = req.query.limit;

        let limit: number | undefined;

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

        const queue = await getDispatchQueue(limit);

        res.status(200).json({
            totalBins: queue.length,
            dispatchQueue: queue
        });
    } catch (error) {
        console.error("Dispatch error:", error);

        res.status(500).json({
            message: "Failed to generate dispatch queue"
        });
    }
});


export default router;
