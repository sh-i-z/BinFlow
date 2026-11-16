import { latLngToCell, cellToBoundary } from "h3-js";
// h3 lib already provide these two methods - id og h and coordn of h

export const getBinCell = (
    latitude: number,
    longitude: number,
    resolution: number = 9  // resolution(1-16)
): string => {
    return latLngToCell(latitude, longitude, resolution);
};

export const getHexagonBoundary = (cellId: string) => {
    return cellToBoundary(cellId);
};
