import { useCallback, useEffect, useState } from "react";
import "../atlas.css";
import Icon from "../components/layout/Icon";
import PageNav from "../components/layout/PageNav";
import { getTrucks, USE_SAMPLE } from "../services/fleetService";
import { getBinColor } from "../components/MapView";
import type { FleetTruck } from "../types/fleet";

const REFRESH_MS = 7000;

const hm = (min: number) => {
    const m = Math.max(0, Math.round(min));
    return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

export default function FleetPage() {
    const [trucks, setTrucks] = useState<FleetTruck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [dusk, setDusk] = useState(false);
    const [run, setRun] = useState<Record<number, "running" | "paused">>({});

    const load = useCallback(async () => {
        try {
            setTrucks(await getTrucks());
            setError(false);
        } catch (e) {
            console.error("Error fetching trucks:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, REFRESH_MS);
        return () => clearInterval(id);
    }, [load]);

    useEffect(() => {
        document.body.style.background = dusk ? "#14170f" : "";
        return () => {
            document.body.style.background = "";
        };
    }, [dusk]);

    const activeCount = trucks.filter((t) => t.status === "active").length;
    const assignedCount = trucks.reduce((s, t) => s + t.assigned_bins.length, 0);
    const onBoard = trucks.reduce((s, t) => s + t.load_kg, 0);
    const capacity = trucks.reduce((s, t) => s + t.capacity_kg, 0);
    const rounds = trucks.reduce((s, t) => s + t.completed_rounds, 0);
    const util = capacity ? Math.round((onBoard / capacity) * 100) : 0;

    const statusOf = (t: FleetTruck) => {
        const r = run[t.id];
        if (r === "running") return { cls: "s-active", text: "On route" };
        if (r === "paused") return { cls: "s-idle", text: "Paused" };
        if (t.status === "active") return { cls: "s-active", text: "Active" };
        if (t.status === "maintenance") return { cls: "s-maint", text: "Maintenance" };
        return { cls: "s-idle", text: "Idle" };
    };

    const toggle = (t: FleetTruck) =>
        setRun((r) => ({ ...r, [t.id]: r[t.id] === "running" ? "paused" : "running" }));

    const i = (n: number) => ({ ["--i" as string]: n });

    const stats = [
        { icon: "truck", label: "Trucks active", value: `${activeCount} / ${trucks.length}` },
        { icon: "hex", label: "Bins assigned", value: String(assignedCount) },
        { icon: "ruler", label: "Waste on board", value: `${onBoard} kg` },
        { icon: "time", label: "Rounds completed", value: String(rounds) },
    ];

    return (
        <main className="hero page" data-light={dusk ? "dusk" : "day"}>
            <aside className="side" aria-label="BinFlow sections">
                <div className="brand">
                    BinFlow
                    <small>Smart Waste · Vol. I</small>
                </div>
                <PageNav current="fleet" />
                <div className="feature">
                    <div className="eyebrow">Fleet utilization</div>
                    <h3>{util}%</h3>
                    <p>
                        {onBoard} of {capacity} kg capacity in use across {trucks.length} trucks.
                    </p>
                </div>
            </aside>

            <section className="page-main">
                <header className="page-head">
                    <div>
                        <div className="eyebrow">Fleet · Plate 04</div>
                        <h1>
                            Fleet<em>three trucks, one shift</em>
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

                <div className="stats">
                    {stats.map((s, n) => (
                        <div className="stat" key={s.label} style={i(n)}>
                            <Icon name={s.icon} size={18} />
                            <div>
                                <b>{loading ? "…" : s.value}</b>
                                <small>{s.label}</small>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="eyebrow list-title">Trucks</div>

                {error && (
                    <p className="page-note">Cannot reach the fleet API. Is the backend running?</p>
                )}
                {!error && !loading && trucks.length === 0 && (
                    <p className="page-note">No trucks found.</p>
                )}

                <div className="trucks">
                    {trucks.map((t, n) => {
                        const st = statusOf(t);
                        const loadPct = Math.min(100, (t.load_kg / t.capacity_kg) * 100);
                        const shiftPct = Math.min(100, (t.shift_used_minutes / t.shift_duration_minutes) * 100);
                        const left = t.shift_duration_minutes - t.shift_used_minutes;
                        const shown = t.assigned_bins.slice(0, 4);
                        const extra = t.assigned_bins.length - shown.length;

                        return (
                            <article className="truck" key={t.id} style={i(n + 4)}>
                                <div className="truck-head">
                                    <div className="truck-ico"><Icon name="truck" size={22} /></div>
                                    <div>
                                        <div className="eyebrow">Truck {String(t.id).padStart(2, "0")}</div>
                                        <h3>{t.truck_code}</h3>
                                    </div>
                                    <span className={`status ${st.cls}`}>{st.text}</span>
                                </div>

                                <dl className="traits">
                                    <div>
                                        <Icon name="range" size={18} />
                                        <dt>Depot</dt>
                                        <dd>{t.depot_latitude.toFixed(3)}, {t.depot_longitude.toFixed(3)}</dd>
                                    </div>
                                    <div>
                                        <Icon name="time" size={18} />
                                        <dt>Round</dt>
                                        <dd>
                                            {t.current_round > 0 ? `#${t.current_round}` : "Not started"} · {t.completed_rounds} done
                                        </dd>
                                    </div>
                                </dl>

                                <div className="meter">
                                    <div className="meter-row">
                                        <span>Load</span>
                                        <b>{t.load_kg} / {t.capacity_kg} kg</b>
                                    </div>
                                    <div className="meter-bar">
                                        <u className={loadPct > 90 ? "hot" : ""} style={{ width: `${loadPct}%` }} />
                                    </div>
                                </div>

                                <div className="meter">
                                    <div className="meter-row">
                                        <span>Shift left</span>
                                        <b>{hm(left)} of {hm(t.shift_duration_minutes)}</b>
                                    </div>
                                    <div className="meter-bar">
                                        <u className={shiftPct > 90 ? "hot" : ""} style={{ width: `${shiftPct}%` }} />
                                    </div>
                                </div>

                                <div className="eyebrow assigned-title">
                                    Assigned bins · {t.assigned_bins.length}
                                </div>
                                {shown.length === 0 ? (
                                    <p className="queue-empty">No bins assigned.</p>
                                ) : (
                                    <ul className="assigned">
                                        {shown.map((b) => (
                                            <li key={b.id}>
                                                <span>{b.name}</span>
                                                <span className="q-fill">
                                                    <i style={{ background: getBinColor(b.fill_level) }} />
                                                    {b.fill_level}% · {b.estimated_waste_kg} kg
                                                </span>
                                            </li>
                                        ))}
                                        {extra > 0 && <li className="more">+{extra} more</li>}
                                    </ul>
                                )}

                                <div className="truck-actions">
                                    <button
                                        className="sim-btn wide"
                                        disabled={t.status === "maintenance" || t.assigned_bins.length === 0}
                                        onClick={() => toggle(t)}
                                    >
                                        <Icon name={run[t.id] === "running" ? "pause" : "play"} size={15} />
                                        <span>{run[t.id] === "running" ? "Pause" : "Start route"}</span>
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}