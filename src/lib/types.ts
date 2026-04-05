export interface EonetGeometry {
  date: string;
  type: "Point" | "Polygon";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface EonetCategory {
  id: string;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
}

export interface EonetResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

export type CategoryId =
  | "wildfires"
  | "severeStorms"
  | "volcanoes"
  | "landslides"
  | "seaLakeIce";
