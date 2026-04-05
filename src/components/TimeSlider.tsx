"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYBACK_SPEED_MS } from "@/lib/constants";

interface TimeSliderProps {
  startDate: string;
  endDate: string;
  currentDate: string;
  onDateChange: (date: string) => void;
}

export default function TimeSlider({
  startDate,
  endDate,
  currentDate,
  onDateChange,
}: TimeSliderProps) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const currentMs = new Date(currentDate).getTime();
  const progress = endMs > startMs ? ((currentMs - startMs) / (endMs - startMs)) * 100 : 100;

  const advanceDay = useCallback(() => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    if (next.getTime() > endMs) {
      setPlaying(false);
      return;
    }
    onDateChange(next.toISOString().split("T")[0]);
  }, [currentDate, endMs, onDateChange]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(advanceDay, PLAYBACK_SPEED_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, advanceDay]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ratio = Number(e.target.value) / 100;
    const dateMs = startMs + ratio * (endMs - startMs);
    const date = new Date(dateMs);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const formatLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.06)] text-white text-xs flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors"
      >
        {playing ? "⏸" : "▶"}
      </button>

      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-[3px] appearance-none bg-[rgba(255,255,255,0.06)] rounded-sm cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.3)]"
        />
      </div>

      <div className="text-[11px] text-[var(--text-muted)] min-w-[120px] text-right">
        {formatLabel(startDate)} — {formatLabel(endDate)}
      </div>
    </div>
  );
}
