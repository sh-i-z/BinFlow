
import { MinHeap } from "../utils/MinHeap";

const heap = new MinHeap<number>((a, b) => a - b);

heap.insert(5);
heap.insert(2);
heap.insert(8);
heap.insert(1);

console.log("Minimum:", heap.peek());
console.log("Extracted:", heap.extractMin());
console.log("Next minimum:", heap.peek());
console.log("Heap size:", heap.size);
