import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import FleetPage from "./pages/FleetPage";
import RoutesPage from "./pages/RoutesPage";

const read = () => window.location.hash.replace(/^#\/?/, "") || "overview";

export default function App() {
  const [page, setPage] = useState(read);

  useEffect(() => {
    const onHash = () => setPage(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "fleet") return <FleetPage />;
  if (page === "routes") return <RoutesPage />;
  return <Dashboard />;
}