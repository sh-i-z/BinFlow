import { useMemo } from "react";
import { Polygon, useMap } from "react-leaflet";
import { cellToBoundary } from "h3-js";
import { getBinColor } from "./MapView";
import type { Bin } from "../types/bin";

type Props = {
  zones: Map<string, Bin[]>;
  selectedCell: string | null;
  onSelect: (cell: string) => void;
};

export default function ZoneLayer({ zones, selectedCell, onSelect }: Props) {
  const map = useMap();

  // zones bins ke neeche rahe, isliye alag pane
  if (!map.getPane("zones")) {
    map.createPane("zones").style.zIndex = "350";
  }

  const key = [...zones.keys()].join("|");
  const shapes = useMemo(
    () =>
      [...zones.keys()].map((cell) => ({
        cell,
        ring: cellToBoundary(cell) as [number, number][],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return (
    <>
      {shapes.map(({ cell, ring }) => {
        const list = zones.get(cell) ?? [];
        const avg = list.reduce((s, b) => s + b.fill_level, 0) / (list.length || 1);
        const color = getBinColor(avg);
        const sel = cell === selectedCell;

        return (
          <Polygon
            key={cell}
            positions={ring}
            pane="zones"
            pathOptions={{
              color: sel ? "#241c14" : color,
              weight: sel ? 2.5 : 1.2,
              fillColor: color,
              fillOpacity: sel ? 0.3 : 0.16,
            }}
            eventHandlers={{ click: () => onSelect(cell) }}
          />
        );
      })}
    </>
  );
}