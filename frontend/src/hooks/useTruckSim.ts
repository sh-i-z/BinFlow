import { useCallback, useEffect, useRef, useState } from "react";
import { getTruckRoute } from "../services/binService";
import { getRoadPath, type LatLng } from "../services/roadPath";
import type { TruckRoute } from "../types/route";

export type SimStatus =
    | "idle"
    | "loading"
    | "ready"
    | "running"
    | "paused"
    | "done"
    | "empty"
    | "error";

const BASE_MPS = 200; // 1x speed: 200 m/s (time-lapse)
const STOP_LIMIT = 10;
const EARTH_R = 6371000;

const toRad = (d: number) => (d * Math.PI) / 180;

const dist = (a: LatLng, b: LatLng): number => {
    const dLa = toRad(b[0] - a[0]);
    const dLn = toRad(b[1] - a[1]);
    const h =
        Math.sin(dLa / 2) ** 2 +
        Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLn / 2) ** 2;
    return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};

export function useTruckSim(onCollect: (binId: number) => void) {
    const [status, setStatus] = useState<SimStatus>("idle");
    const [route, setRoute] = useState<TruckRoute | null>(null);
    const [path, setPath] = useState<LatLng[]>([]);
    const [truck, setTruck] = useState<LatLng | null>(null);
    const [visited, setVisited] = useState(0);
    const [doneIdx, setDoneIdx] = useState(0);
    const [travelled, setTravelled] = useState(0);
    const [totalM, setTotalM] = useState(0);
    const [real, setReal] = useState(true);
    const [speed, setSpeedState] = useState(1);

    const pathRef = useRef<LatLng[]>([]);
    const cumRef = useRef<number[]>([]);
    const stopCumRef = useRef<number[]>([]);
    const routeRef = useRef<TruckRoute | null>(null);
    const totalRef = useRef(0);
    const progressRef = useRef(0);
    const nextRef = useRef(0);
    const lastTsRef = useRef<number | null>(null);
    const dwellRef = useRef(0);
    const rafRef = useRef(0);
    const speedRef = useRef(1);
    const onCollectRef = useRef(onCollect);

    useEffect(() => {
        onCollectRef.current = onCollect;
    }, [onCollect]);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const locate = (m: number): { pos: LatLng; idx: number } => {
        const cum = cumRef.current;
        const p = pathRef.current;
        let lo = 0;
        let hi = cum.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (cum[mid] <= m) lo = mid;
            else hi = mid - 1;
        }
        if (lo >= p.length - 1) return { pos: p[p.length - 1], idx: p.length - 1 };
        const seg = cum[lo + 1] - cum[lo];
        const t = seg > 0 ? (m - cum[lo]) / seg : 0;
        return {
            pos: [
                p[lo][0] + (p[lo + 1][0] - p[lo][0]) * t,
                p[lo][1] + (p[lo + 1][1] - p[lo][1]) * t,
            ],
            idx: lo,
        };
    };

    const generate = useCallback(async () => {
        cancelAnimationFrame(rafRef.current);
        setStatus("loading");
        setRoute(null);
        setPath([]);
        setTruck(null);
        setVisited(0);
        setDoneIdx(0);
        setTravelled(0);
        setTotalM(0);

        try {
            const r = await getTruckRoute(STOP_LIMIT);

            if (r.route.length === 0) {
                setStatus("empty");
                return;
            }

            const points: LatLng[] = [
                [r.depot.latitude, r.depot.longitude],
                ...r.route.map((s) => [s.latitude, s.longitude] as LatLng),
            ];
            const { path: p, real: isReal } = await getRoadPath(points);

            // cumulative distance (metres) along the path
            const cum: number[] = [0];
            for (let i = 1; i < p.length; i++) {
                cum.push(cum[i - 1] + dist(p[i - 1], p[i]));
            }

            // har stop path ke kis point par aata hai (order mein)
            const stopCum: number[] = [];
            let from = 0;
            for (const s of r.route) {
                let best = from;
                let bestD = Infinity;
                for (let j = from; j < p.length; j++) {
                    const dLa = p[j][0] - s.latitude;
                    const dLn = p[j][1] - s.longitude;
                    const d = dLa * dLa + dLn * dLn;
                    if (d < bestD) {
                        bestD = d;
                        best = j;
                    }
                }
                stopCum.push(cum[best]);
                from = best;
            }

            pathRef.current = p;
            cumRef.current = cum;
            stopCumRef.current = stopCum;
            routeRef.current = r;
            totalRef.current = cum[cum.length - 1];
            progressRef.current = 0;
            nextRef.current = 0;
            dwellRef.current = 0;

            setRoute(r);
            setPath(p);
            setReal(isReal);
            setTotalM(cum[cum.length - 1]);
            setTruck(p[0]);
            setStatus("ready");
        } catch (e) {
            console.error("Route error:", e);
            setStatus("error");
        }
    }, []);

    const play = useCallback(() => {
        if (pathRef.current.length === 0) return;
        cancelAnimationFrame(rafRef.current);
        lastTsRef.current = null;
        setStatus("running");

        const tick = (ts: number) => {
            if (lastTsRef.current === null) lastTsRef.current = ts;
            const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
            lastTsRef.current = ts;

            if (ts >= dwellRef.current) {
                progressRef.current = Math.min(
                    totalRef.current,
                    progressRef.current + dt * BASE_MPS * speedRef.current
                );

                const { pos, idx } = locate(progressRef.current);
                setTruck(pos);
                setDoneIdx(idx);
                setTravelled(progressRef.current);

                const stops = routeRef.current?.route ?? [];
                while (
                    nextRef.current < stopCumRef.current.length &&
                    progressRef.current >= stopCumRef.current[nextRef.current]
                ) {
                    onCollectRef.current(stops[nextRef.current].id);
                    nextRef.current += 1;
                    setVisited(nextRef.current);
                    dwellRef.current = ts + 900 / speedRef.current;
                }

                if (progressRef.current >= totalRef.current) {
                    setStatus("done");
                    return;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const pause = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        setStatus("paused");
    }, []);

    const clear = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        pathRef.current = [];
        routeRef.current = null;
        progressRef.current = 0;
        nextRef.current = 0;
        setRoute(null);
        setPath([]);
        setTruck(null);
        setVisited(0);
        setDoneIdx(0);
        setTravelled(0);
        setTotalM(0);
        setStatus("idle");
    }, []);

    const setSpeed = useCallback((s: number) => {
        speedRef.current = s;
        setSpeedState(s);
    }, []);

    return {
        status,
        route,
        path,
        truck,
        visited,
        doneIdx,
        travelled,
        totalM,
        real,
        speed,
        setSpeed,
        generate,
        play,
        pause,
        clear,
    };
}