import Icon from "./Icon";
import PageNav from "./PageNav";
import { getPriority, getBinColor } from "../MapView";
import type { Bin } from "../../types/bin";

type Props = {
    bins: Bin[];
    loading: boolean;
    filter: string | null;
    onFilter: (p: string | null) => void;
    onPick: (bin: Bin) => void;
};

const QUEUE_SIZE = 15;

export default function Sidebar({ bins, loading, filter, onFilter, onPick }: Props) {
    const count = (p: string) =>
        bins.filter((b) => getPriority(b.fill_level) === p).length;

    const label = (n: number) => (loading ? "…" : `${n} bins`);

    const queue = [...bins]
        .filter((b) => b.fill_level > 60)
        .sort((a, b) => b.fill_level - a.fill_level)
        .slice(0, QUEUE_SIZE);

    const NAV = [
        { icon: "home", label: "All bins", sub: label(bins.length), value: null as string | null },
        { icon: "flame", label: "Critical", sub: label(count("Critical")), value: "Critical" },
        { icon: "claw", label: "High", sub: label(count("High")), value: "High" },
        { icon: "wave", label: "Medium", sub: label(count("Medium")), value: "Medium" },
        { icon: "mask", label: "Low", sub: label(count("Low")), value: "Low" },
    ];

    return (
        <aside className="side" aria-label="BinFlow sections">
            <div className="brand">
                BinFlow
                <small>Smart Waste · Vol. I</small>
            </div>

            <PageNav current="overview" />

            <ul className="nav">
                {NAV.map((n) => (
                    <li key={n.label}>
                        <button
                            aria-current={filter === n.value ? "page" : undefined}
                            onClick={() => onFilter(n.value)}
                        >
                            <Icon name={n.icon} />
                            <span>
                                {n.label}
                                <small>{n.sub}</small>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="queue">
                <div className="eyebrow">Dispatch queue</div>
                {queue.length === 0 ? (
                    <p className="queue-empty">
                        {loading ? "Loading bins…" : "No bins need pickup."}
                    </p>
                ) : (
                    <ol>
                        {queue.map((b, i) => (
                            <li key={b.id}>
                                <button onClick={() => onPick(b)}>
                                    <span className="q-rank">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="q-name">{b.name}</span>
                                    <span className="q-fill">
                                        <i style={{ background: getBinColor(b.fill_level) }} />
                                        {b.fill_level}%
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </aside>
    );
}