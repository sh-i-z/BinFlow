
import { pool } from "../config/db";
import { getBinCell } from "../geospatial/h3Converter";

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



// what is happening here ->
// PostgreSQL se saare bins fetch ho rahe hain.
// .map() har bin par iterate karta hai.
// getBinCell() uske coordinates ko H3 ID mein convert karta hai.
// Original bin data ke saath h3CellId attach ho jaati hai.