export interface CityBin {
    name: string;
    latitude: number;
    longitude: number;
    fill_level: number;
}

// Bounding box (Delhi centre ke aas-paas)
const MIN_LAT = 28.6139;
const MAX_LAT = 28.6239;
const MIN_LNG = 77.209;
const MAX_LNG = 77.219;

// Busy jagahen jahan bins zyada hote hain
const HOTSPOTS = [
    { lat: 28.6165, lng: 77.2125 },
    { lat: 28.6205, lng: 77.2155 },
    { lat: 28.6180, lng: 77.2175 },
    { lat: 28.6215, lng: 77.2110 },
];

const CLUSTERED_SHARE = 0.6; // 60% bins hotspots ke paas, baaki poore box mein
const SPREAD = 0.0015;       // hotspot ke aas-paas kitna failav

const clamp = (v: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, v));

const randomBetween = (min: number, max: number): number =>
    min + Math.random() * (max - min);

// Box-Muller: normal distribution ka random number
const gaussian = (): number => {
    const u = 1 - Math.random();
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

export const generateCityBins = (
    count: number = 100
): CityBin[] => {
    const bins: CityBin[] = [];

    for (let i = 0; i < count; i++) {
        let latitude: number;
        let longitude: number;

        if (Math.random() < CLUSTERED_SHARE) {
            const spot = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)];
            latitude = spot.lat + gaussian() * SPREAD;
            longitude = spot.lng + gaussian() * SPREAD;
        } else {
            latitude = randomBetween(MIN_LAT, MAX_LAT);
            longitude = randomBetween(MIN_LNG, MAX_LNG);
        }

        bins.push({
            name: `Bin ${i + 1}`,
            latitude: round6(clamp(latitude, MIN_LAT, MAX_LAT)),
            longitude: round6(clamp(longitude, MIN_LNG, MAX_LNG)),
            fill_level: Math.floor(Math.random() * 101),
        });
    }

    return bins;
};