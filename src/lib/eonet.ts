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
  const { status = "open", limit = 100, start, end } = options;

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
