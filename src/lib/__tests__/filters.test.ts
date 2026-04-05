import { describe, it, expect } from "vitest";
import { filterByCategories, filterByDate, filterByDateRange } from "../filters";
import { EonetEvent } from "../types";

const makeEvent = (
  id: string,
  categoryId: string,
  dates: string[],
  closed: string | null = null
): EonetEvent => ({
  id,
  title: `Event ${id}`,
  description: null,
  closed,
  categories: [{ id: categoryId, title: categoryId }],
  sources: [],
  geometry: dates.map((date) => ({
    date,
    type: "Point" as const,
    coordinates: [0, 0] as [number, number],
  })),
  magnitudeValue: null,
  magnitudeUnit: null,
});

describe("filterByCategories", () => {
  const events = [
    makeEvent("1", "wildfires", ["2025-01-01"]),
    makeEvent("2", "severeStorms", ["2025-01-01"]),
    makeEvent("3", "volcanoes", ["2025-01-01"]),
  ];

  it("returns only events matching active categories", () => {
    const result = filterByCategories(events, new Set(["wildfires"]));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns all events when all categories active", () => {
    const result = filterByCategories(
      events,
      new Set(["wildfires", "severeStorms", "volcanoes"])
    );
    expect(result).toHaveLength(3);
  });

  it("returns empty array when no categories active", () => {
    const result = filterByCategories(events, new Set());
    expect(result).toHaveLength(0);
  });
});

describe("filterByDate", () => {
  const events = [
    makeEvent("1", "wildfires", ["2025-01-05", "2025-01-10"]),
    makeEvent("2", "severeStorms", ["2025-01-08"], "2025-01-12"),
    makeEvent("3", "volcanoes", ["2025-01-15"]),
  ];

  it("includes events with geometry on or before the target date", () => {
    const result = filterByDate(events, "2025-01-10");
    expect(result.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("excludes events that start after the target date", () => {
    const result = filterByDate(events, "2025-01-10");
    expect(result.find((e) => e.id === "3")).toBeUndefined();
  });

  it("includes all events when target date is after all geometry dates", () => {
    const result = filterByDate(events, "2025-02-01");
    expect(result).toHaveLength(3);
  });
});

describe("filterByDateRange", () => {
  const events = [
    makeEvent("1", "wildfires", ["2025-01-05", "2025-01-10"]),
    makeEvent("2", "severeStorms", ["2025-01-08"], "2025-01-12"),
    makeEvent("3", "volcanoes", ["2025-01-15"]),
    makeEvent("4", "landslides", ["2025-01-01", "2025-01-03"]),
  ];

  it("includes events that overlap with the range", () => {
    const result = filterByDateRange(events, "2025-01-06", "2025-01-09");
    expect(result.map((e) => e.id).sort()).toEqual(["1", "2"]);
  });

  it("excludes events entirely outside the range", () => {
    const result = filterByDateRange(events, "2025-01-06", "2025-01-09");
    expect(result.find((e) => e.id === "3")).toBeUndefined();
    expect(result.find((e) => e.id === "4")).toBeUndefined();
  });

  it("includes events that start before but extend into the range", () => {
    const result = filterByDateRange(events, "2025-01-09", "2025-01-20");
    expect(result.map((e) => e.id).sort()).toEqual(["1", "2", "3"]);
  });

  it("returns all events when range covers everything", () => {
    const result = filterByDateRange(events, "2025-01-01", "2025-01-31");
    expect(result).toHaveLength(4);
  });
});
