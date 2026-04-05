import { EONET_BASE_URL } from "./constants";
import { EonetEvent, EonetResponse } from "./types";

interface FetchEventsOptions {
  status?: "open" | "closed" | "all";
  limit?: number;
  start?: string;
  end?: string;
}

export async function fetchEvents(
  options: FetchEventsOptions = {}
): Promise<EonetEvent[]> {
  const { status = "open", limit = 1000, start, end } = options;

  const params = new URLSearchParams();
  params.set("status", status);
  params.set("limit", String(limit));
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const response = await fetch(`${EONET_BASE_URL}/events?${params}`);
  if (!response.ok) {
    throw new Error(`EONET API error: ${response.status}`);
  }

  const data: EonetResponse = await response.json();
  return data.events;
}

/**
 * Fetch events for a date range. Tries a single request first.
 * Only chunks into monthly windows if the single request hits
 * the 1000-event limit (meaning data was likely truncated).
 */
export async function fetchEventsForRange(
  start: string,
  end: string
): Promise<EonetEvent[]> {
  // Try a single request first
  const initial = await fetchEvents({
    status: "all",
    limit: 1000,
    start,
    end,
  });

  // If under the limit, we got everything — done
  if (initial.length < 1000) {
    return initial;
  }

  // Hit the limit — chunk into monthly windows to get complete data
  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");

  const chunks: { start: string; end: string }[] = [];
  const cursor = new Date(startDate);
  while (cursor < endDate) {
    const chunkStart = cursor.toISOString().split("T")[0];
    cursor.setMonth(cursor.getMonth() + 1);
    const chunkEnd =
      cursor >= endDate ? end : cursor.toISOString().split("T")[0];
    chunks.push({ start: chunkStart, end: chunkEnd });
  }

  const BATCH_SIZE = 6;
  const seen = new Set<string>();
  const allEvents: EonetEvent[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((chunk) =>
        fetchEvents({
          status: "all",
          limit: 1000,
          start: chunk.start,
          end: chunk.end,
        })
      )
    );
    for (const events of results) {
      for (const event of events) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          allEvents.push(event);
        }
      }
    }
  }

  return allEvents;
}
