"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GlobeView from "@/components/GlobeView";
import TopBar from "@/components/TopBar";
import CategoryFilters from "@/components/CategoryFilters";
import DetailPanel from "@/components/DetailPanel";
import TimeSlider from "@/components/TimeSlider";
import { fetchEventsForRange } from "@/lib/eonet";
import { filterByCategories, filterByDateRange } from "@/lib/filters";
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

  const debouncedStart = useDebouncedValue(rangeStart, 400);
  const debouncedEnd = useDebouncedValue(rangeEnd, 400);

  // Cumulative event cache: stores all events we've ever fetched, deduped by ID
  const eventMap = useRef(new Map<string, EonetEvent>());
  // The date range we've already fetched and have covered
  const fetchedMin = useRef<string | null>(null);
  const fetchedMax = useRef<string | null>(null);

  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const addEvents = useCallback((newEvents: EonetEvent[]) => {
    let added = false;
    for (const event of newEvents) {
      if (!eventMap.current.has(event.id)) {
        eventMap.current.set(event.id, event);
        added = true;
      }
    }
    if (added) {
      setEvents(Array.from(eventMap.current.values()));
    }
    setLastUpdated(new Date());
  }, []);

  // Fetch only the gaps between what we have and what we need
  const fetchGaps = useCallback(
    async (start: string, end: string) => {
      const gaps: { start: string; end: string }[] = [];

      if (fetchedMin.current === null || fetchedMax.current === null) {
        // First fetch — get the whole range
        gaps.push({ start, end });
      } else {
        // Left gap: new start is before what we have
        if (start < fetchedMin.current) {
          gaps.push({ start, end: fetchedMin.current });
        }
        // Right gap: new end is after what we have
        if (end > fetchedMax.current) {
          gaps.push({ start: fetchedMax.current, end });
        }
      }

      if (gaps.length === 0) return;

      setFetching(true);
      try {
        const results = await Promise.all(
          gaps.map((g) => fetchEventsForRange(g.start, g.end))
        );
        for (const result of results) {
          addEvents(result);
        }

        // Expand our tracked coverage
        const newMin =
          fetchedMin.current === null
            ? start
            : start < fetchedMin.current
              ? start
              : fetchedMin.current;
        const newMax =
          fetchedMax.current === null
            ? end
            : end > fetchedMax.current
              ? end
              : fetchedMax.current;
        fetchedMin.current = newMin;
        fetchedMax.current = newMax;
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setFetching(false);
        setLoading(false);
      }
    },
    [addEvents]
  );

  // Initial fetch
  useEffect(() => {
    fetchGaps(debouncedStart, debouncedEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch gaps when slider changes
  useEffect(() => {
    if (loading) return;
    fetchGaps(debouncedStart, debouncedEnd);
  }, [debouncedStart, debouncedEnd, loading, fetchGaps]);

  // Filter the cumulative cache to just the visible range + active categories
  const visibleEvents = useMemo(() => {
    const byDate = filterByDateRange(events, rangeStart, rangeEnd);
    return filterByCategories(byDate, activeCategories);
  }, [events, rangeStart, rangeEnd, activeCategories]);

  const categoryCounts = useMemo(() => {
    const byDate = filterByDateRange(events, rangeStart, rangeEnd);
    const counts: Record<string, number> = {};
    for (const event of byDate) {
      for (const cat of event.categories) {
        counts[cat.id] = (counts[cat.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [events, rangeStart, rangeEnd]);

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

  if (loading) {
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
        <TopBar eventCount={visibleEvents.length} lastUpdated={lastUpdated} />
      </div>

      <div className="flex flex-1 min-h-0 relative z-0">
        <div className="flex-1 relative overflow-hidden">
          <GlobeView
            events={visibleEvents}
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
          {fetching && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] text-[var(--text-muted)]">
                  Fetching events...
                </span>
              </div>
            </div>
          )}
          {visibleEvents.length === 0 && !loading && !fetching && (
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
