import { describe, it, expect } from "vitest";
import { buildWorldviewUrl } from "../worldview";

describe("buildWorldviewUrl", () => {
  it("builds a URL centered on event coordinates", () => {
    const url = buildWorldviewUrl(-119.2, 34.4, "2025-12-04");
    expect(url).toBe(
      "https://worldview.earthdata.nasa.gov/?v=-129.2,24.4,-109.2,44.4&t=2025-12-04"
    );
  });

  it("clamps longitude bounds to -180/180", () => {
    const url = buildWorldviewUrl(175, 0, "2025-01-01");
    expect(url).toBe(
      "https://worldview.earthdata.nasa.gov/?v=165,-10,180,10&t=2025-01-01"
    );
  });

  it("clamps latitude bounds to -90/90", () => {
    const url = buildWorldviewUrl(0, 85, "2025-06-15");
    expect(url).toBe(
      "https://worldview.earthdata.nasa.gov/?v=-10,75,10,90&t=2025-06-15"
    );
  });
});
