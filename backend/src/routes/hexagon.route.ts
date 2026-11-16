
import { Router, Request, Response } from "express";
import {
    getBinsWithH3Cells,
    getHexagonStats
} from "../services/hexagonService";
const router = Router();

router.get("/", async (_req: Request, res: Response) => {
    try {
        const bins = await getBinsWithH3Cells();

        res.status(200).json({
            count: bins.length,
            bins
        });
    } catch (error) {
        console.error("Error fetching H3 bins:", error);
        res.status(500).json({
            message: "Failed to fetch H3 bins"
        });
    }
});


router.get("/stats", async (_req: Request, res: Response) => {
    try {
        const stats = await getHexagonStats();

        res.status(200).json({
            totalHexagons: stats.length,
            hexagons: stats
        });
    } catch (error) {
        console.error("Error calculating hexagon stats:", error);

        res.status(500).json({
            message: "Failed to calculate hexagon stats"
        });
    }
});


export default router;
