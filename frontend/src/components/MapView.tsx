import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { getBins } from "../services/binService";
import type { Bin } from "../types/bin";

export function getBinColor(fillLevel: number): string {
    if (fillLevel <= 30) return "#5f7f4b";
    if (fillLevel <= 60) return "#c9a227";
    if (fillLevel <= 80) return "#c8742a";
    return "#b4402a";
}

export function getPriority(fill: number): string {
    if (fill > 80) return "Critical";
    if (fill > 60) return "High";
    if (fill > 30) return "Medium";
    return "Low";
}

/* Map ko container ka size badalne par dobara measure karwata hai */
function FixSize() {
    const map = useMap();

    useEffect(() => {
        const ro = new ResizeObserver(() => map.invalidateSize());
        ro.observe(map.getContainer());
        const t = setTimeout(() => map.invalidateSize(), 0);

        return () => {
            ro.disconnect();
            clearTimeout(t);
        };
    }, [map]);

    return null;
}

type Props = {
    selectedId?: number | string | null;
    onSelect: (bin: Bin) => void;
};

function MapView({ selectedId, onSelect }: Props) {
    const [bins, setBins] = useState<Bin[]>([]);

    useEffect(() => {
        const fetchBins = async () => {
            try {
                const data = await getBins();
                setBins(data);
            } catch (error) {
                console.error("Error fetching bins:", error);
            }
        };

        fetchBins();
    }, []);

    return (
        <MapContainer
            center={[28.6139, 77.209]}
            zoom={15}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
        >
            <FixSize />

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {bins.map((bin) => {
                const color = getBinColor(bin.fill_level);
                const selected = bin.id === selectedId;

                return (
                    <CircleMarker
                        key={bin.id}
                        center={[bin.latitude, bin.longitude]}
                        radius={selected ? 13 : 9}
                        pathOptions={{
                            color: selected ? "#241c14" : color,
                            weight: selected ? 2 : 1,
                            fillColor: color,
                            fillOpacity: 0.85,
                        }}
                        eventHandlers={{ click: () => onSelect(bin) }}
                    >
                        <Tooltip>
                            {bin.name} — {bin.fill_level}%
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}

export default MapView;