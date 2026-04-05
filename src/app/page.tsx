"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GlobeView from "@/components/GlobeView";
import TopBar from "@/components/TopBar";
import CategoryFilters from "@/components/CategoryFilters";
import DetailPanel from "@/components/DetailPanel";
import TimeSlider from "@/components/TimeSlider";
import { fetchEvents } from "@/lib/eonet";
import { filterByCategories, filterByDate } from "@/lib/filters";
import { CATEGORIES, AUTO_REFRESH_INTERVAL_MS } from "@/lib/constants";
import { EonetEvent } from "@/lib/types";

export default function Home() {
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EonetEvent | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id))
  );

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [timeRange] = useState({ start: thirtyDaysAgo, end: today });
  const [currentDate, setCurrentDate] = useState(today);

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchEvents({
        status: "all",
        start: timeRange.start,
        end: timeRange.end,
      });
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange.start, timeRange.end]);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    let result = filterByCategories(events, activeCategories);
    result = filterByDate(result, currentDate);
    return result;
  }, [events, activeCategories, currentDate]);

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
      <TopBar eventCount={filteredEvents.length} lastUpdated={lastUpdated} />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          <GlobeView
            events={filteredEvents}
            onEventClick={setSelectedEvent}
            onEventHover={() => {}}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <CategoryFilters
              activeCategories={activeCategories}
              onToggle={handleToggleCategory}
            />
          </div>
          {filteredEvents.length === 0 && !loading && (
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

      <TimeSlider
        startDate={timeRange.start}
        endDate={timeRange.end}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />
    </div>
  );
}
