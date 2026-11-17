import { useEffect } from "react";
import { Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "../services/roadPath";
import type { TruckRoute } from "../types/route";

const TRUCK_SVG =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>';

const truckIcon = L.divIcon({
    className: "truck-dot",
    html: TRUCK_SVG,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

const depotIcon = L.divIcon({
    className: "depot-pin",
    html: "<span>D</span>",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const stopIcon = (n: number, done: boolean) =>
    L.divIcon({
        className: done ? "stop-pin done" : "stop-pin",
        html: `<span>${n}</span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

type Props = {
    route: TruckRoute | null;
    path: LatLng[];
    truck: LatLng | null;
    visited: number;
    doneIdx: number;
};

export default function TruckLayer({ route, path, truck, visited, doneIdx }: Props) {
    const map = useMap();

    useEffect(() => {
        if (path.length > 1) {
            map.fitBounds(L.latLngBounds(path), { padding: [90, 90] });
        }
    }, [path, map]);

    if (!route || path.length === 0) return null;

    const travelled: LatLng[] = truck
        ? [...path.slice(0, doneIdx + 1), truck]
        : [];

    return (
        <>
            <Polyline
                positions={path}
                interactive={false}
                pathOptions={{ color: "#241c14", weight: 3, opacity: 0.55, dashArray: "6 8" }}
            />
            {travelled.length > 1 && (
                <Polyline
                    positions={travelled}
                    interactive={false}
                    pathOptions={{ color: "#b4532a", weight: 4, opacity: 0.95 }}
                />
            )}

            <Marker
                position={[route.depot.latitude, route.depot.longitude]}
                icon={depotIcon}
                interactive={false}
            />

            {route.route.map((s, i) => (
                <Marker
                    key={s.id}
                    position={[s.latitude, s.longitude]}
                    icon={stopIcon(i + 1, i < visited)}
                    interactive={false}
                />
            ))}

            {truck && (
                <Marker
                    position={truck}
                    icon={truckIcon}
                    interactive={false}
                    zIndexOffset={1000}
                />
            )}
        </>
    );
}