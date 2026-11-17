export type LatLng = [number, number];

/* OSRM public demo server se sadak ke raste ki line. Fail ho toh seedhi line. */
export async function getRoadPath(
    points: LatLng[]
): Promise<{ path: LatLng[]; real: boolean }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
        const coords = points.map(([la, ln]) => `${ln},${la}`).join(";");
        const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
            { signal: controller.signal }
        );
        if (!res.ok) throw new Error("OSRM failed");

        const json = await res.json();
        const geom = json.routes?.[0]?.geometry?.coordinates as
            | [number, number][]
            | undefined;
        if (!geom || geom.length < 2) throw new Error("No geometry");

        return {
            path: geom.map(([ln, la]) => [la, ln] as LatLng),
            real: true,
        };
    } catch {
        return { path: points, real: false };
    } finally {
        clearTimeout(timer);
    }
}