import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchEvents } from "../eonet";
import { EonetResponse } from "../types";

const mockResponse: EonetResponse = {
  title: "EONET Events",
  description: "Natural events",
  link: "https://eonet.gsfc.nasa.gov/api/v3/events",
  events: [
    {
      id: "EONET_1",
      title: "Wildfire - California",
      description: null,
      closed: null,
      categories: [{ id: "wildfires", title: "Wildfires" }],
      sources: [{ id: "InciWeb", url: "https://inciweb.example.com" }],
      geometry: [
        { date: "2025-12-04T00:00:00Z", type: "Point", coordinates: [-119.2, 34.4] },
      ],
      magnitudeValue: null,
      magnitudeUnit: null,
    },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchEvents", () => {
  it("fetches open events by default", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const events = await fetchEvents();
    expect(fetch).toHaveBeenCalledWith(
      "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=1000"
    );
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Wildfire - California");
  });

  it("supports date range parameters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchEvents({ start: "2025-01-01", end: "2025-01-31", status: "all" });
    expect(fetch).toHaveBeenCalledWith(
      "https://eonet.gsfc.nasa.gov/api/v3/events?status=all&limit=1000&start=2025-01-01&end=2025-01-31"
    );
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    await expect(fetchEvents()).rejects.toThrow("EONET API error: 500");
  });
});
