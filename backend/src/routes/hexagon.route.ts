
import { Router, Request, Response } from "express";
import {
    getBinsWithH3Cells,
    getHexagonStats,
    getHexagonsWithBoundaries
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


router.get("/boundaries", async (_req: Request, res: Response) => {
    try {
        const hexagons = await getHexagonsWithBoundaries();

        res.status(200).json({
            totalHexagons: hexagons.length,
            hexagons
        });
    } catch (error) {
        console.error("Error fetching hexagon boundaries:", error);

        res.status(500).json({
            message: "Failed to fetch hexagon boundaries"
        });
    }
});

export default router;
