import { EonetEvent } from "./types";

export function filterByCategories(
  events: EonetEvent[],
  activeCategories: Set<string>
): EonetEvent[] {
  return events.filter((event) =>
    event.categories.some((cat) => activeCategories.has(cat.id))
  );
}

export function filterByDate(
  events: EonetEvent[],
  targetDate: string
): EonetEvent[] {
  const target = new Date(targetDate).getTime();
  return events.filter((event) => {
    const firstGeometry = new Date(event.geometry[0].date).getTime();
    return firstGeometry <= target;
  });
}

export function filterByDateRange(
  events: EonetEvent[],
  rangeStart: string,
  rangeEnd: string
): EonetEvent[] {
  const startMs = new Date(rangeStart).getTime();
  const endMs = new Date(rangeEnd).getTime();
  return events.filter((event) => {
    const firstGeo = new Date(event.geometry[0].date).getTime();
    const lastGeo = new Date(
      event.geometry[event.geometry.length - 1].date
    ).getTime();
    // Event's effective end is the later of: last geometry point or closed date
    const eventEnd = event.closed
      ? Math.max(lastGeo, new Date(event.closed).getTime())
      : lastGeo;
    // Event overlaps with range if it started before range ends AND was still active at or after range starts
    return firstGeo <= endMs && eventEnd >= startMs;
  });
}
