// Our rules:
// 1. Critical bins come before High, Medium and Low.
// 2. If two bins have the same priority, higher fill_level comes first.


import type { BinPriority } from "./binPriority";

export interface DispatchBin {
    id: number;
    name: string;
    fill_level: number;
    priority: BinPriority;
}

const priorityRank: Record<BinPriority, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4
};

export const compareDispatchBins = (
    a: DispatchBin,
    b: DispatchBin
): number => {
    const priorityDifference =
        priorityRank[a.priority] - priorityRank[b.priority];

    if (priorityDifference !== 0) {
        return priorityDifference;
    }

    // Higher fill level gets higher urgency
    return b.fill_level - a.fill_level;
};

// Why b.fill_level - a.fill_level?

// Suppose both bins are critical:
// - Bin A: 95% full
// - Bin B: 85% full
// We want Bin A first. The comparator returns a negative value for A compared with B, so the Min Heap puts A ahead.
