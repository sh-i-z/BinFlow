export interface CityBin {
    name: string;
    latitude: number;
    longitude: number;
    fill_level: number;
}

export const generateCityBins = (
    count: number = 100
): CityBin[] => {
    const bins: CityBin[] = [];

    const rows = Math.ceil(Math.sqrt(count));
    const columns = Math.ceil(count / rows);

    const startLat = 28.6139;
    const startLng = 77.2090;

    const spacing = 0.001;

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;

        bins.push({
            name: `Bin ${i + 1}`,
            latitude: startLat + row * spacing,
            longitude: startLng + col * spacing,
            fill_level: Math.floor(Math.random() * 101)
        });
    }

    return bins;
};

// What this code does
// - Generates 100 bins by default.
// - Places them in a grid around the chosen starting coordinates.
// - Gives each bin a unique name.
// - Assigns a random initial fill level between 0 and 100.