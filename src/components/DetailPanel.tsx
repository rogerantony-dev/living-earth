import { EonetEvent } from "@/lib/types";
import { CATEGORY_COLOR_MAP, DEFAULT_POINT_COLOR } from "@/lib/constants";
import { buildWorldviewUrl } from "@/lib/worldview";

interface DetailPanelProps {
  event: EonetEvent | null;
  onClose: () => void;
}

export default function DetailPanel({ event, onClose }: DetailPanelProps) {
  if (!event) return null;

  const category = event.categories[0];
  const color = CATEGORY_COLOR_MAP[category?.id] ?? DEFAULT_POINT_COLOR;
  const latestGeometry = event.geometry[event.geometry.length - 1];
  const [lon, lat] = latestGeometry.coordinates;
  const dateStr = latestGeometry.date.split("T")[0];
  const worldviewUrl = buildWorldviewUrl(lon, lat, dateStr);

  return (
    <div className="w-[300px] border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 overflow-y-auto animate-slide-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
          Event Details
        </span>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        <span
          className="text-[11px] uppercase tracking-wider"
          style={{ color }}
        >
          {category?.title}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">
        {event.title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        {lat.toFixed(2)}°{lat >= 0 ? "N" : "S"},{" "}
        {Math.abs(lon).toFixed(2)}°{lon >= 0 ? "E" : "W"}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="Status"
          value={event.closed ? "Closed" : "Open"}
          valueColor={event.closed ? "var(--text-muted)" : "#22c55e"}
          prefix={event.closed ? "○" : "●"}
        />
        <StatCard
          label="Started"
          value={formatDate(event.geometry[0].date)}
        />
        <StatCard
          label="Sources"
          value={event.sources.map((s) => s.id).join(", ") || "—"}
        />
        <StatCard
          label="Points"
          value={`${event.geometry.length} location${event.geometry.length > 1 ? "s" : ""}`}
        />
      </div>

      {event.geometry.length > 1 && (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
            Event Timeline
          </div>
          <div className="relative pl-4 border-l border-[rgba(255,255,255,0.1)]">
            {event.geometry.map((geo, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div
                  className="absolute left-[-3.5px] w-[7px] h-[7px] rounded-full"
                  style={{ background: color }}
                />
                <div className="text-[11px] text-[var(--text-muted)]">
                  {formatDate(geo.date)}
                </div>
                <div className="text-xs">
                  {geo.coordinates[1].toFixed(2)}°,{" "}
                  {geo.coordinates[0].toFixed(2)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <a
        href={worldviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center py-2.5 rounded-lg text-xs border transition-colors"
        style={{
          background: "rgba(59,130,246,0.1)",
          borderColor: "rgba(59,130,246,0.2)",
          color: "#3b82f6",
        }}
      >
        View in NASA Worldview →
      </a>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor,
  prefix,
}: {
  label: string;
  value: string;
  valueColor?: string;
  prefix?: string;
}) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2.5">
      <div className="text-[10px] uppercase text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div className="text-[13px]" style={{ color: valueColor }}>
        {prefix && <span className="mr-1">{prefix}</span>}
        {value}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
