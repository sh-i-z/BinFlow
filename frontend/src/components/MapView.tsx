import { useEffect, type ReactNode } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
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

function ExposeMap({ onReady }: { onReady?: (m: LeafletMap) => void }) {
    const map = useMap();

    useEffect(() => {
        onReady?.(map);
    }, [map, onReady]);

    return null;
}

/* Map ko bins ke area tak restrict karta hai */
function LockToBins({ bins }: { bins: Bin[] }) {
    const map = useMap();

    useEffect(() => {
        if (bins.length === 0) return;

        const bounds = L.latLngBounds(
            bins.map((b) => [b.latitude, b.longitude] as [number, number])
        ).pad(0.25);

        map.setMaxBounds(bounds);
        map.options.maxBoundsViscosity = 1.0;

        const fitZoom = map.getBoundsZoom(bounds);
        map.setMinZoom(fitZoom);

        if (!map.getBounds().intersects(bounds)) {
            map.fitBounds(bounds);
        } else if (map.getZoom() < fitZoom) {
            map.setZoom(fitZoom);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bins.length, map]);

    return null;
}

function FlyToSelected({ bin }: { bin: Bin | null }) {
    const map = useMap();

    useEffect(() => {
        if (!bin) return;
        map.flyTo([bin.latitude, bin.longitude], Math.max(map.getZoom(), 15), {
            duration: 0.8,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bin?.id, map]);

    return null;
}

type Props = {
    bins: Bin[];
    allBins: Bin[];
    selected: Bin | null;
    onSelect: (bin: Bin) => void;
    onReady?: (m: LeafletMap) => void;
    children?: ReactNode;
};

function MapView({ bins, allBins, selected, onSelect, onReady, children }: Props) {
    return (
        <MapContainer
            center={[28.6139, 77.209]}
            zoom={15}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
        >
            <FixSize />
            <ExposeMap onReady={onReady} />
            <LockToBins bins={allBins} />
            <FlyToSelected bin={selected} />

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {bins.map((bin) => {
                const color = getBinColor(bin.fill_level);
                const isSelected = bin.id === selected?.id;

                return (
                    <CircleMarker
                        key={bin.id}
                        center={[bin.latitude, bin.longitude]}
                        radius={isSelected ? 13 : 9}
                        pathOptions={{
                            color: isSelected ? "#241c14" : color,
                            weight: isSelected ? 2 : 1,
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

            {children}
        </MapContainer>
    );
}

export default MapView;