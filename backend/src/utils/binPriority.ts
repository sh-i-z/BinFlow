export type BinPriority = "low" | "medium" | "high" | "critical";

export const getBinPriority = (fillLevel: number): BinPriority => {
    if (fillLevel <= 30) return "low";
    if (fillLevel <= 60) return "medium";
    if (fillLevel <= 80) return "high";
    return "critical";
};