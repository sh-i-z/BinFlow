import Icon from "./Icon";

const NAV = [
    { icon: "home", label: "Home", sub: "" },
    { icon: "star", label: "Overview", sub: "", current: true },
    { icon: "flame", label: "Full bins", sub: "6 bins" },
    { icon: "wave", label: "Overflow zones", sub: "14 zones" },
    { icon: "claw", label: "Routes", sub: "22 routes" },
    { icon: "skull", label: "Faulty sensors", sub: "9 sensors" },
    { icon: "peak", label: "Depots", sub: "11 depots" },
    { icon: "mask", label: "Collectors", sub: "8 crews" },
];

export default function Sidebar() {
    return (
        <aside className="side" aria-label="BinFlow sections">
            <div className="brand">
                BinFlow
                <small>Smart Waste · Vol. I</small>
            </div>

            <ul className="nav">
                {NAV.map((n) => (
                    <li key={n.label}>
                        <button aria-current={n.current ? "page" : undefined}>
                            <Icon name={n.icon} />
                            <span>
                                {n.label}
                                {n.sub && <small>{n.sub}</small>}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="feature">
                <div className="eyebrow">Featured bin</div>
                <h3>A city that empties itself.</h3>
                <p>Fill levels, routes and alerts in one quiet plate.</p>
                <a href="#detail">
                    Learn more <Icon name="arrow" size={14} />
                </a>
            </div>
        </aside>
    );
}