interface TopBarProps {
  eventCount: number;
  lastUpdated: Date | null;
}

export default function TopBar({ eventCount, lastUpdated }: TopBarProps) {
  const timeAgo = lastUpdated
    ? formatTimeAgo(lastUpdated)
    : "Loading...";

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]" />
        <span className="font-semibold text-sm tracking-wide">
          LIVING EARTH
        </span>
        <span className="text-[11px] text-[var(--text-muted)] ml-1">LIVE</span>
      </div>
      <div className="flex gap-4 text-xs text-[var(--text-muted)]">
        <span>{eventCount} active events</span>
        <span>Last updated: {timeAgo}</span>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
