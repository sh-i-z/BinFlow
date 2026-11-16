import Icon from "./Icon";
import { getPriority } from "../MapView";
import type { Bin } from "../../types/bin";

type Props = {
    bins: Bin[];
    loading: boolean;
    filter: string | null;
    onFilter: (p: string | null) => void;
    onPick: (bin: Bin) => void;
};

export default function Sidebar({ bins, loading, filter, onFilter, onPick }: Props) {
    const count = (p: string) =>
        bins.filter((b) => getPriority(b.fill_level) === p).length;

    const top = bins.reduce<Bin | null>(
        (best, b) => (!best || b.fill_level > best.fill_level ? b : best),
        null
    );

    const label = (n: number) => (loading ? "…" : `${n} bins`);

    const NAV = [
        { icon: "home", label: "Overview", sub: label(bins.length), value: null as string | null },
        { icon: "flame", label: "Critical", sub: label(count("Critical")), value: "Critical" },
        { icon: "claw", label: "High", sub: label(count("High")), value: "High" },
        { icon: "wave", label: "Medium", sub: label(count("Medium")), value: "Medium" },
        { icon: "mask", label: "Low", sub: label(count("Low")), value: "Low" },
        { icon: "peak", label: "Zones", sub: "soon", off: true },
        { icon: "skull", label: "Routes", sub: "soon", off: true },
    ];

    return (
        <aside className="side" aria-label="BinFlow sections">
            <div className="brand">
                BinFlow
                <small>Smart Waste · Vol. I</small>
            </div>

            <ul className="nav">
                {NAV.map((n) => (
                    <li key={n.label}>
                        <button
                            disabled={n.off}
                            aria-current={!n.off && filter === n.value ? "page" : undefined}
                            onClick={() => !n.off && onFilter(n.value ?? null)}
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

            <div className="feature">
                <div className="eyebrow">Most urgent bin</div>
                {top ? (
                    <>
                        <h3>{top.name}</h3>
                        <p>
                            {top.fill_level}% full · {getPriority(top.fill_level)} priority
                        </p>
                        <button className="link" onClick={() => onPick(top)}>
                            Locate on map <Icon name="arrow" size={14} />
                        </button>
                    </>
                ) : (
                    <p>{loading ? "Loading bins…" : "No bins available."}</p>
                )}
            </div>
        </aside>
    );
}