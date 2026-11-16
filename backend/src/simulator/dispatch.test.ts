
import assert from "node:assert/strict";
import { MinHeap } from "../utils/MinHeap";
import {
    compareDispatchBins,
    type DispatchBin
} from "../utils/dispatchComparator";

const bins: DispatchBin[] = [
    { id: 1, name: "Bin A", fill_level: 85, priority: "critical" },
    { id: 2, name: "Bin B", fill_level: 95, priority: "critical" },
    { id: 3, name: "Bin C", fill_level: 70, priority: "high" },
    { id: 4, name: "Bin D", fill_level: 40, priority: "medium" },
    { id: 5, name: "Bin E", fill_level: 20, priority: "low" }
];

const heap = new MinHeap<DispatchBin>(compareDispatchBins);

bins.forEach((bin) => heap.insert(bin));

const result: string[] = [];

while (!heap.isEmpty()) {
    result.push(heap.extractMin()!.name);
}

assert.deepEqual(result, [
    "Bin B",
    "Bin A",
    "Bin C",
    "Bin D",
    "Bin E"
]);

console.log("Dispatch priority test passed!");
console.log("Dispatch order:", result);
