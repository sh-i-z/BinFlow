// Is service ka kaam hoga:
// 1. Database se bins fetch karna.
// 2. Har bin ki priority calculate karna.
// 3. Bin ko Min Heap mein insert karna.
// 4. Heap se most urgent bins nikalna.


import { pool } from "../config/db";
import { MinHeap } from "../utils/MinHeap";
import { getBinPriority } from "../utils/binPriority";
import {
    compareDispatchBins,
    type DispatchBin
} from "../utils/dispatchComparator";


export const getDispatchQueue = async (limit?: number) => {
    const result = await pool.query(
        `SELECT id, name, fill_level
         FROM bins`
    );

    const heap = new MinHeap<DispatchBin>(
        compareDispatchBins
    );

    for (const bin of result.rows) {
        const dispatchBin: DispatchBin = {
            id: Number(bin.id),
            name: bin.name,
            fill_level: bin.fill_level,
            priority: getBinPriority(bin.fill_level)
        };

        heap.insert(dispatchBin);
    }

    const dispatchQueue: DispatchBin[] = [];

    while (!heap.isEmpty() &&
        (limit === undefined || dispatchQueue.length < limit)) {
        dispatchQueue.push(heap.extractMin()!);
    }

    return dispatchQueue;
};
