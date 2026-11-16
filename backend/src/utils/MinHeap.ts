
export class MinHeap<T> {
    private heap: T[] = [];

    constructor(
        private compare: (a: T, b: T) => number
    ) { }

    // Insert a new element
    insert(value: T): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    // Return the smallest element without removing it
    peek(): T | undefined {
        return this.heap[0];
    }

    // Remove and return the smallest element
    extractMin(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];

        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);

        return min;
    }

    // Move an element upwards
    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (
                this.compare(
                    this.heap[index],
                    this.heap[parentIndex]
                ) >= 0
            ) {
                break;
            }

            [this.heap[index], this.heap[parentIndex]] =
                [this.heap[parentIndex], this.heap[index]];

            index = parentIndex;
        }
    }

    // Move an element downwards
    private bubbleDown(index: number): void {
        const size = this.heap.length;

        while (true) {
            let smallest = index;

            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (
                left < size &&
                this.compare(this.heap[left], this.heap[smallest]) < 0
            ) {
                smallest = left;
            }

            if (
                right < size &&
                this.compare(this.heap[right], this.heap[smallest]) < 0
            ) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            [this.heap[index], this.heap[smallest]] =
                [this.heap[smallest], this.heap[index]];

            index = smallest;
        }
    }

    get size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}
