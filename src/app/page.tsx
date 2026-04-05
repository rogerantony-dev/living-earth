"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GlobeView from "@/components/GlobeView";
import TopBar from "@/components/TopBar";
import CategoryFilters from "@/components/CategoryFilters";
import DetailPanel from "@/components/DetailPanel";
import TimeSlider from "@/components/TimeSlider";
import { fetchEventsForRange } from "@/lib/eonet";
import { filterByCategories } from "@/lib/filters";
import { CATEGORIES } from "@/lib/constants";
import { EonetEvent } from "@/lib/types";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<EonetEvent | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id))
  );

  const [dates] = useState(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const fiveYearsAgoDate = new Date(now);
    fiveYearsAgoDate.setFullYear(now.getFullYear() - 5);
    const fiveYearsAgo = fiveYearsAgoDate.toISOString().split("T")[0];
    const midpoint = new Date(
      (fiveYearsAgoDate.getTime() + now.getTime()) / 2
    );
    const initStart = new Date(midpoint);
    initStart.setMonth(midpoint.getMonth() - 3);
    const initEnd = new Date(midpoint);
    initEnd.setMonth(midpoint.getMonth() + 3);
    return {
      trackMin: fiveYearsAgo,
      trackMax: today,
      initStart: initStart.toISOString().split("T")[0],
      initEnd: initEnd.toISOString().split("T")[0],
    };
  });

  const [rangeStart, setRangeStart] = useState(dates.initStart);
  const [rangeEnd, setRangeEnd] = useState(dates.initEnd);

  // Debounce the range values so we don't fire API calls on every drag pixel
  const debouncedStart = useDebouncedValue(rangeStart, 400);
  const debouncedEnd = useDebouncedValue(rangeEnd, 400);

  const {
    data: events = [],
    isFetching,
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["eonet-events", debouncedStart, debouncedEnd],
    queryFn: () => fetchEventsForRange(debouncedStart, debouncedEnd),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    placeholderData: (prev) => prev, // keep previous data while fetching new range
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const event of events) {
      for (const cat of event.categories) {
        counts[cat.id] = (counts[cat.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return filterByCategories(events, activeCategories);
  }, [events, activeCategories]);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-[var(--text-muted)]">
            Loading natural events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="relative z-10">
        <TopBar eventCount={filteredEvents.length} lastUpdated={lastUpdated} />
      </div>

      <div className="flex flex-1 min-h-0 relative z-0">
        <div className="flex-1 relative overflow-hidden">
          <GlobeView
            events={filteredEvents}
            onEventClick={setSelectedEvent}
            onEventHover={() => {}}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <CategoryFilters
              activeCategories={activeCategories}
              categoryCounts={categoryCounts}
              onToggle={handleToggleCategory}
            />
          </div>
          {isFetching && !isLoading && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] text-[var(--text-muted)]">
                  Fetching events...
                </span>
              </div>
            </div>
          )}
          {filteredEvents.length === 0 && !isLoading && !isFetching && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <p className="text-sm text-[var(--text-muted)] bg-[var(--bg-primary)] px-4 py-2 rounded-lg">
                No events match current filters
              </p>
            </div>
          )}
        </div>

        <DetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>

      <div className="relative z-10">
        <TimeSlider
          minDate={dates.trackMin}
          maxDate={dates.trackMax}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeChange={(start, end) => {
            setRangeStart(start);
            setRangeEnd(end);
          }}
        />
      </div>
    </div>
  );
}
