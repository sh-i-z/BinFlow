
export const simulateFillLevel = (
    currentFill: number,
    wasteRate: number
): number => {

    const updatedFill = currentFill + wasteRate;

    return Math.min(updatedFill, 100);
};
