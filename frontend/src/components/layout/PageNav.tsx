import Icon from "./Icon";

const PAGES = [
    { href: "#/", id: "overview", icon: "home", label: "Overview" },
    { href: "#/fleet", id: "fleet", icon: "truck", label: "Fleet" },
    { id: "analytics", icon: "ruler", label: "Analytics", off: true },
    { id: "history", icon: "time", label: "History", off: true },
];

export default function PageNav({ current }: { current: string }) {
    return (
        <nav className="pages" aria-label="Pages">
            {PAGES.map((p) =>
                p.off ? (
                    <span key={p.id} className="off">
                        <Icon name={p.icon} size={16} />
                        {p.label}
                        <small>soon</small>
                    </span>
                ) : (
                    <a
                        key={p.id}
                        href={p.href}
                        aria-current={current === p.id ? "page" : undefined}
                    >
                        <Icon name={p.icon} size={16} />
                        {p.label}
                    </a>
                )
            )}
        </nav>
    );
}