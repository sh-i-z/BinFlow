import { useCallback, useEffect, useMemo, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { latLngToCell } from "h3-js";
import "../atlas.css";
import Sidebar from "../components/layout/Sidebar";
import Icon from "../components/layout/Icon";
import MapView, { getPriority } from "../components/MapView";
import TruckLayer from "../components/TruckLayer";
import ZoneLayer from "../components/ZoneLayer";
import { useTruckSim } from "../hooks/useTruckSim";
import { getBins, collectBin } from "../services/binService";
import type { Bin } from "../types/bin";

const REFRESH_MS = 7000;
const SPEEDS = [1, 2, 4];
const H3_RES = 8;

export default function Dashboard() {
    const [bins, setBins] = useState<Bin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedId, setSelectedId] = useState<Bin["id"] | null>(null);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [showZones, setShowZones] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [map, setMap] = useState<LeafletMap | null>(null);
    const [dusk, setDusk] = useState(false);
    const [focus, setFocus] = useState(false);
    const [collecting, setCollecting] = useState(false);
    const [collectError, setCollectError] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getBins();
            setBins(data);
            setError(false);
        } catch (e) {
            console.error("Error fetching bins:", e);
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
    }, [dusk]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const collectOne = useCallback(async (id: number) => {
        try {
            const updated = await collectBin(id);
            setBins((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        } catch (e) {
            console.error("Error collecting bin:", e);
        }
    }, []);

    const sim = useTruckSim(collectOne);

    /* H3 zones: cell -> us cell ki bins */
    const zones = useMemo(() => {
        const m = new Map<string, Bin[]>();
        for (const b of bins) {
            const cell = latLngToCell(b.latitude, b.longitude, H3_RES);
            const list = m.get(cell);
            if (list) list.push(b);
            else m.set(cell, [b]);
        }
        return m;
    }, [bins]);

    const q = query.trim().toLowerCase();
    const visible = bins.filter(
        (b) =>
            (!filter || getPriority(b.fill_level) === filter) &&
            (!q || b.name.toLowerCase().includes(q) || String(b.id) === q)
    );
    const filtering = Boolean(filter || q);

    const selected = bins.find((b) => b.id === selectedId) ?? null;
    const priority = selected ? getPriority(selected.fill_level) : "";

    const zoneBins = selectedCell ? zones.get(selectedCell) ?? [] : [];
    const zoneAvg = zoneBins.length
        ? Math.round(zoneBins.reduce((s, b) => s + b.fill_level, 0) / zoneBins.length)
        : 0;
    const zoneCritical = zoneBins.filter((b) => b.fill_level > 80).length;
    const zoneHigh = zoneBins.filter((b) => b.fill_level > 60 && b.fill_level <= 80).length;
    const zonePriority = getPriority(zoneAvg);
    const zoneAction =
        zoneCritical >= 3
            ? "Several bins are critical. Dispatch a truck to this zone now."
            : zoneCritical > 0
                ? "Include this zone in the next route. Critical bins are waiting."
                : zoneAvg > 60
                    ? "Filling fast. Plan a pickup within this shift."
                    : "No action needed for now.";
    const zoneTop = [...zoneBins].sort((a, b) => b.fill_level - a.fill_level).slice(0, 5);

    const pick = (b: Bin) => {
        setSelectedId(b.id);
        setSelectedCell(null);
        setCollectError(false);
    };

    const pickZone = (cell: string) => {
        setSelectedCell(cell);
        setSelectedId(null);
    };

    const handleCollect = async () => {
        if (!selected || collecting) return;
        setCollecting(true);
        setCollectError(false);
        try {
            const updated = await collectBin(selected.id);
            setBins((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        } catch (e) {
            console.error("Error collecting bin:", e);
            setCollectError(true);
        } finally {
            setCollecting(false);
        }
    };

    const caption = error
        ? "Cannot reach the API. Is the backend running?"
        : loading
            ? "Loading bins…"
            : selected
                ? selected.name
                : selectedCell
                    ? `Zone · ${zoneBins.length} bins`
                    : filtering
                        ? `${visible.length} of ${bins.length} bins shown`
                        : "Tap a bin or a zone to read its plate.";

    const i = (n: number) => ({ ["--i" as string]: n });

    const simActive = ["ready", "running", "paused", "done"].includes(sim.status);
    const totalStops = sim.route?.route.length ?? 0;
    const nextStop = sim.route?.route[sim.visited];
    const leftKm = Math.max(0, sim.totalM - sim.travelled) / 1000;
    const pct = sim.totalM > 0 ? (sim.travelled / sim.totalM) * 100 : 0;
    const cycleSpeed = () =>
        sim.setSpeed(SPEEDS[(SPEEDS.indexOf(sim.speed) + 1) % SPEEDS.length]);

    return (
        <main
            className={`hero${focus ? " focus" : ""}`}
            data-light={dusk ? "dusk" : "day"}
        >
            <div className="stage-map">
                <MapView
                    bins={visible}
                    allBins={bins}
                    selected={selected}
                    onSelect={pick}
                    onReady={setMap}
                >
                    {showZones && (
                        <ZoneLayer zones={zones} selectedCell={selectedCell} onSelect={pickZone} />
                    )}
                    <TruckLayer
                        route={sim.route}
                        path={sim.path}
                        truck={sim.truck}
                        visited={sim.visited}
                        doneIdx={sim.doneIdx}
                    />
                </MapView>
            </div>

            <Sidebar
                bins={bins}
                loading={loading}
                filter={filter}
                onFilter={setFilter}
                onPick={pick}
            />

            <section className="main">
                <div className="stage">
                    <div className="plate" aria-hidden="true">
                        <i /><i /><i /><i />
                    </div>

                    <div className="sim">
                        <div className="eyebrow">Truck route</div>

                        {(sim.status === "idle" ||
                            sim.status === "error" ||
                            sim.status === "empty") && (
                                <>
                                    <p className="sim-text">
                                        {sim.status === "error"
                                            ? "Could not plan a route. Is the backend running?"
                                            : sim.status === "empty"
                                                ? "No bins need collecting right now."
                                                : "Plan a pickup run for the most urgent bins."}
                                    </p>
                                    <button className="sim-btn wide" onClick={() => sim.generate()}>
                                        Generate route
                                    </button>
                                </>
                            )}

                        {sim.status === "loading" && <p className="sim-text">Planning route…</p>}

                        {simActive && (
                            <>
                                <h4>
                                    {sim.status === "done"
                                        ? "Route complete"
                                        : `Stop ${Math.min(sim.visited + 1, totalStops)} of ${totalStops}`}
                                </h4>
                                <p className="sim-text">
                                    {sim.status === "done"
                                        ? `${totalStops} bins collected`
                                        : nextStop
                                            ? `Next: ${nextStop.name} · ${nextStop.fill_level}%`
                                            : ""}
                                </p>

                                <div className="sim-bar">
                                    <u style={{ width: `${pct}%` }} />
                                </div>
                                <p className="sim-meta">
                                    {leftKm.toFixed(1)} km left · planner estimate{" "}
                                    {sim.route?.totalDistance.toFixed(1)} km
                                </p>

                                <div className="sim-controls">
                                    {sim.status !== "done" &&
                                        (sim.status === "running" ? (
                                            <button className="sim-btn" aria-label="Pause" onClick={sim.pause}>
                                                <Icon name="pause" size={16} />
                                            </button>
                                        ) : (
                                            <button className="sim-btn" aria-label="Play" onClick={sim.play}>
                                                <Icon name="play" size={16} />
                                            </button>
                                        ))}
                                    {sim.status !== "done" && (
                                        <button className="sim-btn" aria-label="Change speed" onClick={cycleSpeed}>
                                            {sim.speed}x
                                        </button>
                                    )}
                                    {sim.status === "done" ? (
                                        <button className="sim-btn wide" onClick={() => sim.generate()}>
                                            New route
                                        </button>
                                    ) : (
                                        <button className="sim-btn" aria-label="Clear route" onClick={sim.clear}>
                                            <Icon name="close" size={16} />
                                        </button>
                                    )}
                                </div>

                                {!sim.real && (
                                    <p className="sim-meta">
                                        Road routing unavailable, showing straight lines.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="rail" role="toolbar" aria-label="Viewer tools">
                        <button aria-label="Zoom in" onClick={() => map?.zoomIn()}>
                            <Icon name="plus" size={17} />
                        </button>
                        <button aria-label="Zoom out" onClick={() => map?.zoomOut()}>
                            <Icon name="minus" size={17} />
                        </button>
                        <button
                            className={showZones ? "on" : ""}
                            aria-pressed={showZones}
                            aria-label={showZones ? "Hide zones" : "Show zones"}
                            onClick={() => {
                                setShowZones((z) => !z);
                                setSelectedCell(null);
                            }}
                        >
                            <Icon name="hex" size={17} />
                        </button>
                        <button
                            className={focus ? "on" : ""}
                            aria-pressed={focus}
                            aria-label={focus ? "Close expanded viewer" : "Expand viewer"}
                            onClick={() => setFocus((f) => !f)}
                        >
                            <Icon name="expand" size={17} />
                        </button>
                        <button
                            className={dusk ? "on" : ""}
                            aria-pressed={dusk}
                            aria-label={dusk ? "Switch to daylight" : "Switch to dusk lighting"}
                            onClick={() => setDusk((d) => !d)}
                        >
                            <Icon name="sun" size={17} />
                        </button>
                    </div>

                    <ul className="legend">
                        <li><span style={{ background: "#5f7f4b" }} />Low</li>
                        <li><span style={{ background: "#c9a227" }} />Medium</li>
                        <li><span style={{ background: "#c8742a" }} />High</li>
                        <li><span style={{ background: "#b4402a" }} />Critical</li>
                    </ul>

                    <p className="caption">{caption}</p>
                </div>
            </section>

            <section className="info">
                <div className="top">
                    <label className="search">
                        <Icon name="search" size={15} />
                        <input
                            placeholder="Search bins by name or ID…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>
                    <button className="iconbtn" aria-label="Notifications">
                        <Icon name="bell" size={18} />
                    </button>
                    <button className="iconbtn" aria-label="Account">
                        <span className="avatar"><Icon name="user" size={15} /></span>
                    </button>
                </div>

                <div className="card">
                    {selected ? (
                        <article className="detail" key={String(selected.id)} aria-live="polite">
                            <div className="eyebrow" style={i(0)}>
                                Bin · No. {String(selected.id).padStart(3, "0")}
                            </div>
                            <h1 style={i(1)}>
                                {selected.name}
                                <em>{priority} priority</em>
                            </h1>
                            <div className="tags" style={i(2)}>
                                <span>{priority}</span>
                                <span>{selected.fill_level}% full</span>
                            </div>
                            <p className="lede" style={i(3)}>
                                {priority === "Critical"
                                    ? "Close to overflowing. Send a collector as soon as possible."
                                    : priority === "High"
                                        ? "Filling fast. Schedule a pickup on the next route."
                                        : priority === "Medium"
                                            ? "Half full. No action needed yet, keep an eye on it."
                                            : "Plenty of room. Nothing to do here."}
                            </p>

                            <div className="era" style={i(4)}>
                                <div className="bar">
                                    <b /><b /><b />
                                    <u style={{ left: 0, width: `${Math.max(0.6, selected.fill_level)}%` }} />
                                </div>
                                <div className="lab">
                                    <span>Empty</span><span>Half</span><span>Full</span>
                                </div>
                            </div>

                            <h2 style={i(5)}>Field notes</h2>
                            <dl className="traits" style={i(6)}>
                                <div><Icon name="ruler" size={18} /><dt>Fill level</dt><dd>{selected.fill_level}%</dd></div>
                                <div><Icon name="time" size={18} /><dt>Priority</dt><dd>{priority}</dd></div>
                                <div><Icon name="range" size={18} /><dt>Latitude</dt><dd>{Number(selected.latitude).toFixed(4)}</dd></div>
                                <div><Icon name="range" size={18} /><dt>Longitude</dt><dd>{Number(selected.longitude).toFixed(4)}</dd></div>
                            </dl>

                            <div className="action-wrap" style={i(7)}>
                                <button
                                    className="action"
                                    onClick={handleCollect}
                                    disabled={collecting || selected.fill_level === 0}
                                >
                                    <span>
                                        {collecting
                                            ? "Collecting…"
                                            : selected.fill_level === 0
                                                ? "Already empty"
                                                : "Mark as collected"}
                                    </span>
                                    <Icon name="chev" size={18} />
                                </button>
                                {collectError && (
                                    <p className="action-error">Could not reach the API. Try again.</p>
                                )}
                            </div>
                        </article>
                    ) : selectedCell && zoneBins.length > 0 ? (
                        <article className="detail" key={selectedCell} aria-live="polite">
                            <div className="eyebrow" style={i(0)}>Zone · H3 resolution {H3_RES}</div>
                            <h1 style={i(1)}>
                                {zoneBins.length} bins
                                <em>{selectedCell}</em>
                            </h1>
                            <div className="tags" style={i(2)}>
                                <span>{zonePriority}</span>
                                <span>{zoneAvg}% average</span>
                            </div>
                            <p className="lede" style={i(3)}>{zoneAction}</p>

                            <div className="era" style={i(4)}>
                                <div className="bar">
                                    <b /><b /><b />
                                    <u style={{ left: 0, width: `${Math.max(0.6, zoneAvg)}%` }} />
                                </div>
                                <div className="lab">
                                    <span>Empty</span><span>Half</span><span>Full</span>
                                </div>
                            </div>

                            <h2 style={i(5)}>Zone notes</h2>
                            <dl className="traits" style={i(6)}>
                                <div><Icon name="hex" size={18} /><dt>Bins</dt><dd>{zoneBins.length}</dd></div>
                                <div><Icon name="ruler" size={18} /><dt>Average fill</dt><dd>{zoneAvg}%</dd></div>
                                <div><Icon name="time" size={18} /><dt>Critical</dt><dd>{zoneCritical}</dd></div>
                                <div><Icon name="time" size={18} /><dt>High</dt><dd>{zoneHigh}</dd></div>
                            </dl>

                            <h2 style={i(7)}>Fullest bins</h2>
                            <ul className="zone-list" style={i(8)}>
                                {zoneTop.map((b) => (
                                    <li key={b.id}>
                                        <button onClick={() => pick(b)}>
                                            <span>{b.name}</span>
                                            <span>{b.fill_level}%</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="action-wrap" style={i(9)}>
                                <button className="action" onClick={() => setSelectedCell(null)}>
                                    <span>Close zone</span>
                                    <Icon name="close" size={18} />
                                </button>
                            </div>
                        </article>
                    ) : (
                        <article className="detail empty">
                            <div className="eyebrow">Nothing selected</div>
                            <h1>Pick a bin<em>or a zone on the map</em></h1>
                            <p className="lede">
                                Click a marker for bin details, or a hexagon for a zone summary and recommended action.
                            </p>
                        </article>
                    )}
                </div>
            </section>
        </main>
    );
}