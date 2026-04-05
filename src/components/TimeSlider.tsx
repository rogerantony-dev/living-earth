"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYBACK_SPEED_MS } from "@/lib/constants";

interface TimeSliderProps {
  /** Absolute earliest date in the data */
  minDate: string;
  /** Absolute latest date in the data */
  maxDate: string;
  /** Currently selected range start */
  rangeStart: string;
  /** Currently selected range end */
  rangeEnd: string;
  onRangeChange: (start: string, end: string) => void;
}

function toMs(d: string) {
  return new Date(d).getTime();
}
function toDateStr(ms: number) {
  return new Date(ms).toISOString().split("T")[0];
}
function formatLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function TimeSlider({
  minDate,
  maxDate,
  rangeStart,
  rangeEnd,
  onRangeChange,
}: TimeSliderProps) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | null>(null);

  const minMs = toMs(minDate);
  const maxMs = toMs(maxDate);
  const span = Math.max(1, maxMs - minMs);

  const startPct = ((toMs(rangeStart) - minMs) / span) * 100;
  const endPct = ((toMs(rangeEnd) - minMs) / span) * 100;

  // Playback: advance the whole window forward by 1 day each tick
  const advanceDay = useCallback(() => {
    const nextEnd = new Date(rangeEnd);
    nextEnd.setDate(nextEnd.getDate() + 1);
    if (nextEnd.getTime() > maxMs) {
      setPlaying(false);
      return;
    }
    const nextStart = new Date(rangeStart);
    nextStart.setDate(nextStart.getDate() + 1);
    onRangeChange(toDateStr(nextStart.getTime()), toDateStr(nextEnd.getTime()));
  }, [rangeStart, rangeEnd, maxMs, onRangeChange]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(advanceDay, PLAYBACK_SPEED_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, advanceDay]);

  const pctToDate = useCallback(
    (pct: number) => {
      const clamped = Math.max(0, Math.min(100, pct));
      return toDateStr(minMs + (clamped / 100) * span);
    },
    [minMs, span]
  );

  const getPointerPct = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    },
    []
  );

  const handlePointerDown = useCallback(
    (thumb: "start" | "end") => (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = thumb;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const pct = getPointerPct(e.clientX);
      const date = pctToDate(pct);
      if (dragging.current === "start") {
        if (toMs(date) < toMs(rangeEnd)) {
          onRangeChange(date, rangeEnd);
        }
      } else {
        if (toMs(date) > toMs(rangeStart)) {
          onRangeChange(rangeStart, date);
        }
      }
    },
    [getPointerPct, pctToDate, rangeStart, rangeEnd, onRangeChange]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.06)] text-white text-xs flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors shrink-0"
      >
        {playing ? "⏸" : "▶"}
      </button>

      {/* Date label: range start */}
      <span className="text-[11px] text-[var(--text-primary)] min-w-[90px] tabular-nums">
        {formatLabel(rangeStart)}
      </span>

      {/* Dual-thumb track */}
      <div
        ref={trackRef}
        className="flex-1 relative h-6 flex items-center select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)]" />

        {/* Active range highlight */}
        <div
          className="absolute h-[3px] rounded-full"
          style={{
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />

        {/* Start thumb */}
        <div
          className="absolute w-3 h-3 rounded-full bg-white cursor-grab active:cursor-grabbing"
          style={{
            left: `${startPct}%`,
            transform: "translateX(-50%)",
            boxShadow: "0 0 6px rgba(255,255,255,0.3)",
          }}
          onPointerDown={handlePointerDown("start")}
        />

        {/* End thumb */}
        <div
          className="absolute w-3 h-3 rounded-full bg-white cursor-grab active:cursor-grabbing"
          style={{
            left: `${endPct}%`,
            transform: "translateX(-50%)",
            boxShadow: "0 0 6px rgba(255,255,255,0.3)",
          }}
          onPointerDown={handlePointerDown("end")}
        />
      </div>

      {/* Date label: range end */}
      <span className="text-[11px] text-[var(--text-primary)] min-w-[90px] text-right tabular-nums">
        {formatLabel(rangeEnd)}
      </span>
    </div>
  );
}
