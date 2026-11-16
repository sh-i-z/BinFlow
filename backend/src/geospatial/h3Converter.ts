import { latLngToCell } from "h3-js";

export const getBinCell = (
    latitude: number,
    longitude: number,
    resolution: number = 9  // resolution(1-16)
): string => {
    return latLngToCell(latitude, longitude, resolution);
};
