
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    Tooltip
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { getBins } from "../services/binService";
import type { Bin } from "../types/bin";

function getBinColor(fillLevel: number): string {
    if (fillLevel <= 30) return "green";
    if (fillLevel <= 60) return "yellow";
    if (fillLevel <= 80) return "orange";
    return "red";
}

function MapView() {
    const [bins, setBins] = useState<Bin[]>([]);

    useEffect(() => {
        const fetchBins = async () => {
            try {
                const data = await getBins();
                setBins(data);
                console.table(
                    data.map((bin) => ({
                        name: bin.name,
                        fill_level: bin.fill_level,
                        color: getBinColor(bin.fill_level)
                    }))
                );
            } catch (error) {
                console.error("Error fetching bins:", error);
            }
        };

        fetchBins();
    }, []);

    return (
        <MapContainer
            center={[28.6139, 77.2090]}
            zoom={15}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {bins.map((bin) => (
                <CircleMarker
                    key={bin.id}
                    center={[bin.latitude, bin.longitude]}
                    radius={9}
                    pathOptions={{
                        color: getBinColor(bin.fill_level),
                        fillColor: getBinColor(bin.fill_level),
                        fillOpacity: 0.8
                    }}
                >
                    <Tooltip>
                        {bin.name} — {bin.fill_level}%
                    </Tooltip>

                    <Popup>
                        <strong>{bin.name}</strong>
                        <p>Fill Level: {bin.fill_level}%</p>
                        <p>Priority: {bin.fill_level > 80
                            ? "Critical"
                            : bin.fill_level > 60
                                ? "High"
                                : bin.fill_level > 30
                                    ? "Medium"
                                    : "Low"}
                        </p>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}

export default MapView;
