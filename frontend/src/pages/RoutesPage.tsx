import { useCallback, useEffect, useState } from "react";
import "../atlas.css";
import Icon from "../components/layout/Icon";
import PageNav from "../components/layout/PageNav";
import { getOptimization, USE_SAMPLE } from "../services/optimizationService";
import type { OptimizationReport, PlanMetrics, PlannedRoute } from "../types/optimization";

const hm = (min: number) => {
    const m = Math.max(0, Math.round(min));
    return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

const saved = (base: number, now: number) =>
    base === 0 ? 0 : ((base - now) / base) * 100;

type Row = {
    label: string;
    key: keyof PlanMetrics;
    fmt: (n: number) => string;
    better: "lower" | "higher" | "none";
};

const ROWS: Row[] = [
    { label: "Total distance", key: "distance_km", fmt: (n) => `${n.toFixed(1)} km`, better: "lower" },
    { label: "Fleet time", key: "fleet_time_min", fmt: hm, better: "lower" },
    { label: "Bins collected", key: "bins_collected", fmt: String, better: "higher" },
    { label: "Waste collected", key: "waste_kg", fmt: (n) => `${n} kg`, better: "higher" },
    { label: "Critical bins served", key: "critical_served", fmt: String, better: "higher" },
    { label: "Collection rounds", key: "rounds", fmt: String, better: "none" },
    { label: "Truck utilization", key: "utilization_pct", fmt: (n) => `${n}%`, better: "higher" },
    { label: "Workload balance", key: "balance_pct", fmt: (n) => `${n}%`, better: "higher" },
];

function MiniMap({ route }: { route: PlannedRoute }) {
    const W = 220;
    const H = 120;
    const pad = 14;
    const pt = ([x, y]: [number, number]) =>
        `${pad + x * (W - pad * 2)},${pad + y * (H - pad * 2)}`;
    const line = route.points.map(pt).join(" ");
    const [dx, dy] = pt(route.points[0]).split(",").map(Number);

    return (
        <svg
            className="mini"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Route map for ${route.truck_code} round ${route.round}`}
        >
            <g className="mini-grid">
                {[1, 2, 3].map((n) => (
                    <line key={`v${n}`} x1={(W / 4) * n} y1="0" x2={(W / 4) * n} y2={H} />
                ))}
                {[1, 2].map((n) => (
                    <line key={`h${n}`} x1="0" y1={(H / 3) * n} x2={W} y2={(H / 3) * n} />
                ))}
            </g>
            <polyline className="mini-line" points={line} />
            {route.points.slice(1, -1).map((p, n) => {
                const [x, y] = pt(p).split(",").map(Number);
                return <circle key={n} className="mini-stop" cx={x} cy={y} r="3.5" />;
            })}
            <rect className="mini-depot" x={dx - 5} y={dy - 5} width="10" height="10" rx="1.5" />
        </svg>
    );
}

export default function RoutesPage() {
    const [report, setReport] = useState<OptimizationReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [dusk, setDusk] = useState(false);

    const load = useCallback(async () => {
        try {
            setReport(await getOptimization());
            setError(false);
        } catch (e) {
            console.error("Error fetching optimization:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        document.body.style.background = dusk ? "#14170f" : "";
        return () => {
            document.body.style.background = "";
        };
    }, [dusk]);

    const i = (n: number) => ({ ["--i" as string]: n });

    const b = report?.baseline;
    const f = report?.binflow;
    const timeSaved = b && f ? saved(b.fleet_time_min, f.fleet_time_min) : 0;
    const distSaved = b && f ? saved(b.distance_km, f.distance_km) : 0;
    const signed = (n: number) => `${n >= 0 ? "-" : "+"}${Math.abs(n).toFixed(1)}%`;

    const stats =
        b && f
            ? [
                { icon: "time", label: "Time saved", value: signed(timeSaved) },
                { icon: "ruler", label: "Distance saved", value: signed(distSaved) },
                { icon: "flame", label: "Critical bins served", value: `${f.critical_served} vs ${b.critical_served}` },
                { icon: "truck", label: "Rounds", value: `${f.rounds} vs ${b.rounds}` },
            ]
            : [];

    const maxMin = report
        ? Math.max(...report.trucks.flatMap((t) => [t.baseline_min, t.binflow_min]), 1)
        : 1;

    return (
        <main className="hero page" data-light={dusk ? "dusk" : "day"}>
            <aside className="side" aria-label="BinFlow sections">
                <div className="brand">
                    BinFlow
                    <small>Smart Waste · Vol. I</small>
                </div>
                <PageNav current="routes" />
                <div className="feature">
                    <div className="eyebrow">Planner result</div>
                    <h3>
                        {loading || !b
                            ? "…"
                            : `${timeSaved >= 0 ? "-" : "+"}${Math.abs(timeSaved).toFixed(0)}% time`}
                    </h3>
                    <p>BinFlow vs nearest-first baseline, same bins and same truck limits.</p>
                </div>
            </aside>

            <section className="page-main">
                <header className="page-head">
                    <div>
                        <div className="eyebrow">Routes · Plate 05</div>
                        <h1>
                            Route optimization<em>baseline against BinFlow</em>
                        </h1>
                    </div>
                    <div className="page-tools">
                        {USE_SAMPLE && <span className="badge">Sample data</span>}
                        <button
                            className={`iconbtn sq${dusk ? " on" : ""}`}
                            aria-pressed={dusk}
                            aria-label={dusk ? "Switch to daylight" : "Switch to dusk lighting"}
                            onClick={() => setDusk((d) => !d)}
                        >
                            <Icon name="sun" size={17} />
                        </button>
                    </div>
                </header>

                {error && <p className="page-note">Cannot reach the analytics API. Is the backend running?</p>}
                {loading && <p className="page-note">Loading…</p>}

                {report && b && f && (
                    <>
                        <div className="stats">
                            {stats.map((s, n) => (
                                <div className="stat" key={s.label} style={i(n)}>
                                    <Icon name={s.icon} size={18} />
                                    <div>
                                        <b>{s.value}</b>
                                        <small>{s.label}</small>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="eyebrow list-title">Baseline vs BinFlow</div>
                        <div className="compare" style={i(4)}>
                            <div className="cmp-head">
                                <span>Metric</span>
                                <span>Baseline</span>
                                <span>BinFlow</span>
                                <span>Change</span>
                            </div>
                            {ROWS.map((r) => {
                                const bv = b[r.key];
                                const fv = f[r.key];
                                const diff = bv === 0 ? 0 : ((fv - bv) / bv) * 100;
                                const good =
                                    r.better === "none" ? null : r.better === "lower" ? fv < bv : fv > bv;
                                const cls = good === null || fv === bv ? "n" : good ? "g" : "x";
                                return (
                                    <div className="cmp-row" key={r.label}>
                                        <span>{r.label}</span>
                                        <span className="mono">{r.fmt(bv)}</span>
                                        <span className="mono strong">{r.fmt(fv)}</span>
                                        <span className={`delta ${cls}`}>
                                            {fv === bv ? "same" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="page-note">
                            Green means BinFlow did better, rust means it did worse. Both planners use the same bins, trucks, depots and limits.
                        </p>

                        <div className="eyebrow list-title">Truck workload</div>
                        <div className="workload" style={i(5)}>
                            {report.trucks.map((t) => (
                                <div className="wl-row" key={t.truck_code}>
                                    <b>{t.truck_code}</b>
                                    <div className="wl-bars">
                                        <div className="wl-line">
                                            <small>Baseline</small>
                                            <div className="meter-bar">
                                                <u className="base" style={{ width: `${(t.baseline_min / maxMin) * 100}%` }} />
                                            </div>
                                            <span className="mono">
                                                {hm(t.baseline_min)} · {t.baseline_km.toFixed(1)} km
                                            </span>
                                        </div>
                                        <div className="wl-line">
                                            <small>BinFlow</small>
                                            <div className="meter-bar">
                                                <u style={{ width: `${(t.binflow_min / maxMin) * 100}%` }} />
                                            </div>
                                            <span className="mono">
                                                {hm(t.binflow_min)} · {t.binflow_km.toFixed(1)} km
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="eyebrow list-title">Planned rounds</div>
                        <div className="rcards">
                            {report.routes.map((r, n) => (
                                <article className="rcard" key={r.id} style={i(n + 6)}>
                                    <header>
                                        <b>#{r.id}</b>
                                        <span>
                                            {r.truck_code} · Round {r.round}
                                        </span>
                                    </header>
                                    <MiniMap route={r} />
                                    <dl>
                                        <div>
                                            <dt>Status</dt>
                                            <dd>
                                                <span className={`dot ${r.status}`} />
                                                {r.status}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Stops</dt>
                                            <dd>{r.points.length - 2}</dd>
                                        </div>
                                        <div>
                                            <dt>Start</dt>
                                            <dd>{r.start}</dd>
                                        </div>
                                        <div>
                                            <dt>End</dt>
                                            <dd>{r.end}</dd>
                                        </div>
                                        <div>
                                            <dt>Distance</dt>
                                            <dd>{r.distance_km.toFixed(1)} km</dd>
                                        </div>
                                        <div>
                                            <dt>Duration</dt>
                                            <dd>{hm(r.duration_min)}</dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}