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
