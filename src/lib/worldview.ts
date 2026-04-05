export function buildWorldviewUrl(
  lon: number,
  lat: number,
  date: string
): string {
  const pad = 10;
  const minLon = Math.max(-180, lon - pad);
  const minLat = Math.max(-90, lat - pad);
  const maxLon = Math.min(180, lon + pad);
  const maxLat = Math.min(90, lat + pad);

  return `https://worldview.earthdata.nasa.gov/?v=${minLon},${minLat},${maxLon},${maxLat}&t=${date}`;
}
