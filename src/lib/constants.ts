import { CategoryId } from "./types";

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  color: string;
  pulsing: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "wildfires", label: "Wildfires", color: "#f97316", pulsing: true },
  { id: "severeStorms", label: "Storms", color: "#3b82f6", pulsing: true },
  { id: "volcanoes", label: "Volcanoes", color: "#ef4444", pulsing: true },
  { id: "landslides", label: "Landslides", color: "#a855f7", pulsing: false },
  { id: "seaLakeIce", label: "Sea/Lake Ice", color: "#06b6d4", pulsing: false },
];

export const CATEGORY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.color])
);

export const DEFAULT_POINT_COLOR = "#888888";

export const GLOBE_IMAGE_URL =
  "//unpkg.com/three-globe/example/img/earth-night.jpg";

export const NIGHT_SKY_URL =
  "//unpkg.com/three-globe/example/img/night-sky.png";

export const EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v3";

export const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const PLAYBACK_SPEED_MS = 200; // 1 day per 200ms
