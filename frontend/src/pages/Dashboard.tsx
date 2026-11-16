import { useEffect, useState } from "react";
import "../atlas.css";
import Sidebar from "../components/layout/Sidebar";
import Icon from "../components/layout/Icon";
import MapView, { getPriority } from "../components/MapView";
import type { Bin } from "../types/bin";

export default function Dashboard() {
    const [selected, setSelected] = useState<Bin | null>(null);
    const [dusk, setDusk] = useState(false);
    const [focus, setFocus] = useState(false);

    useEffect(() => {
        document.body.style.background = dusk ? "#14170f" : "";
    }, [dusk]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const priority = selected ? getPriority(selected.fill_level) : "";

    return (
        <main
            className={`hero${focus ? " focus" : ""}`}
            data-light={dusk ? "dusk" : "day"}
        >
            <Sidebar />

            <section className="main">
                <div className="stage">
                    <div className="stage-map">
                        <MapView selectedId={selected?.id} onSelect={setSelected} />
                    </div>

                    <div className="plate" aria-hidden="true">
                        <i /><i /><i /><i />
                    </div>

                    <div className="rail" role="toolbar" aria-label="Viewer tools">
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

                    <p className="caption">
                        {selected ? selected.name : "Tap a bin to read its plate."}
                    </p>
                </div>
            </section>

            <section className="info">
                <div className="top">
                    <label className="search">
                        <Icon name="search" size={15} />
                        <input placeholder="Search bins, zones, or routes…" />
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
                            <div className="eyebrow" style={{ ["--i" as string]: 0 }}>
                                Bin · Specimen {String(selected.id).padStart(3, "0")}
                            </div>
                            <h1 style={{ ["--i" as string]: 1 }}>
                                {selected.name}
                                <em>Smart bin</em>
                            </h1>
                            <div className="tags" style={{ ["--i" as string]: 2 }}>
                                <span>{priority}</span>
                                <span>{selected.fill_level}% full</span>
                            </div>
                            <p className="lede" style={{ ["--i" as string]: 3 }}>
                                {priority === "Critical"
                                    ? "Close to overflowing. Send a collector as soon as possible."
                                    : priority === "High"
                                        ? "Filling fast. Schedule a pickup on the next route."
                                        : priority === "Medium"
                                            ? "Half full. No action needed yet, keep an eye on it."
                                            : "Plenty of room. Nothing to do here."}
                            </p>

                            <div className="era" style={{ ["--i" as string]: 4 }}>
                                <div className="bar">
                                    <b /><b /><b />
                                    <u style={{ left: 0, width: `${Math.max(.6, selected.fill_level)}%` }} />
                                </div>
                                <div className="lab">
                                    <span>Empty</span><span>Half</span><span>Full</span>
                                </div>
                            </div>

                            <h2 style={{ ["--i" as string]: 5 }}>Field notes</h2>
                            <dl className="traits" style={{ ["--i" as string]: 6 }}>
                                <div><Icon name="ruler" size={18} /><dt>Fill level</dt><dd>{selected.fill_level}%</dd></div>
                                <div><Icon name="time" size={18} /><dt>Priority</dt><dd>{priority}</dd></div>
                                <div><Icon name="range" size={18} /><dt>Latitude</dt><dd>{Number(selected.latitude).toFixed(4)}</dd></div>
                                <div><Icon name="range" size={18} /><dt>Longitude</dt><dd>{Number(selected.longitude).toFixed(4)}</dd></div>
                            </dl>

                            <h2 style={{ ["--i" as string]: 7 }}>Haunts</h2>
                            <div className="habitat" style={{ ["--i" as string]: 8 }}>
                                <Icon name="reed" size={18} />
                                <span>Delhi, {Number(selected.latitude).toFixed(3)}°N, {Number(selected.longitude).toFixed(3)}°E</span>
                            </div>

                            <div className="closeup-wrap" style={{ ["--i" as string]: 9 }}>
                                <button className="closeup">
                                    <div className="lens" />
                                    <span>
                                        <b>Dispatch collector</b>
                                        <small>Assign a crew to empty this bin.</small>
                                    </span>
                                    <Icon name="chev" size={18} />
                                </button>
                            </div>
                        </article>
                    ) : (
                        <article className="detail empty">
                            <div className="eyebrow">No specimen selected</div>
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