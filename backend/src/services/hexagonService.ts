
import { pool } from "../config/db";
import {
    getBinCell,
    getHexagonBoundary
} from "../geospatial/h3Converter";
import { getBinPriority } from "../utils/binPriority";

export const getBinsWithH3Cells = async () => {
    const result = await pool.query(
        `SELECT id, name, latitude, longitude, fill_level
         FROM bins
         ORDER BY id ASC`
    );

    const binsWithCells = result.rows.map((bin) => ({
        ...bin,
        h3CellId: getBinCell(
            Number(bin.latitude),
            Number(bin.longitude),
            9
        )
    }));

    return binsWithCells;
};


// what is happening till here ->
// PostgreSQL se saare bins fetch ho rahe hain.
// .map() har bin par iterate karta hai.
// getBinCell() uske coordinates ko H3 ID mein convert karta hai.
// Original bin data ke saath h3CellId attach ho jaati hai.

export const groupBinsByHexagon = async () => {
    const bins = await getBinsWithH3Cells();

    const hexagonMap = new Map<string, typeof bins>();

    for (const bin of bins) {
        const cellId = bin.h3CellId;

        if (!hexagonMap.has(cellId)) {
            hexagonMap.set(cellId, []);
        }

        hexagonMap.get(cellId)!.push(bin);
    }

    return hexagonMap;
};

// table of bin vs fill%
export const getHexagonStats = async () => {
    const hexagonMap = await groupBinsByHexagon();

    const hexagonStats = [];

    for (const [cellId, bins] of hexagonMap) {
        const totalFill = bins.reduce(
            (sum, bin) => sum + bin.fill_level,
            0
        );

        const averageFill = totalFill / bins.length;

        hexagonStats.push({
            h3CellId: cellId,
            binCount: bins.length,
            averageFill: Number(averageFill.toFixed(2)),
            priority: getBinPriority(averageFill)
        });
    }

    return hexagonStats;
    // - reduce() sabhi fill levels ka sum calculate karta hai.
    // - bins.length total bins batata hai.
    // - Sum ko total bins se divide karke average nikalta hai.
    // Result: 85% average fill.
};


export const getHexagonsWithBoundaries = async () => {
    const stats = await getHexagonStats();

    return stats.map((hexagon) => ({
        ...hexagon,
        boundary: getHexagonBoundary(hexagon.h3CellId)
    }));
};




