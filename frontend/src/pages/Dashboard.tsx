import { useCallback, useEffect, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "../atlas.css";
import Sidebar from "../components/layout/Sidebar";
import Icon from "../components/layout/Icon";
import MapView, { getPriority } from "../components/MapView";
import { getBins } from "../services/binService";
import type { Bin } from "../types/bin";

const REFRESH_MS = 30000;

export default function Dashboard() {
    const [bins, setBins] = useState<Bin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedId, setSelectedId] = useState<Bin["id"] | null>(null);
    const [filter, setFilter] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [map, setMap] = useState<LeafletMap | null>(null);
    const [dusk, setDusk] = useState(false);
    const [focus, setFocus] = useState(false);

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

    const q = query.trim().toLowerCase();
    const visible = bins.filter(
        (b) =>
            (!filter || getPriority(b.fill_level) === filter) &&
            (!q || b.name.toLowerCase().includes(q) || String(b.id) === q)
    );
    const filtering = Boolean(filter || q);

    const selected = bins.find((b) => b.id === selectedId) ?? null;
    const priority = selected ? getPriority(selected.fill_level) : "";
    const pick = (b: Bin) => setSelectedId(b.id);

    const caption = error
        ? "Cannot reach the API. Is the backend running?"
        : loading
            ? "Loading bins…"
            : selected
                ? selected.name
                : filtering
                    ? `${visible.length} of ${bins.length} bins shown`
                    : "Tap a bin to read its plate.";

    const i = (n: number) => ({ ["--i" as string]: n });

    return (
        <main
            className={`hero${focus ? " focus" : ""}`}
            data-light={dusk ? "dusk" : "day"}
        >
            <div className="stage-map">
                <MapView
                    bins={visible}
                    selected={selected}
                    onSelect={pick}
                    onReady={setMap}
                />
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

                    <div className="rail" role="toolbar" aria-label="Viewer tools">
                        <button aria-label="Zoom in" onClick={() => map?.zoomIn()}>
                            <Icon name="plus" size={17} />
                        </button>
                        <button aria-label="Zoom out" onClick={() => map?.zoomOut()}>
                            <Icon name="minus" size={17} />
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
                        </article>
                    ) : (
                        <article className="detail empty">
                            <div className="eyebrow">No bin selected</div>
                            <h1>Pick a bin<em>on the map</em></h1>
                            <p className="lede">
                                Click any marker on the plate to read its fill level, priority and location here.
                            </p>
                        </article>
                    )}
                </div>
            </section>
        </main>
    );
}