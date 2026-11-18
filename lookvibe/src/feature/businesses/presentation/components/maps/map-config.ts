import L from 'leaflet';

export type LatLngTuple = [number, number];

export const DEFAULT_MAP_CENTER: LatLngTuple = [3.4516, -76.532];

export const MAP_TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
};

export const DARK_MAP_CLASS =
  'h-full w-full bg-[#0f172a] [&_.leaflet-tile-pane]:[filter:invert(1)_hue-rotate(180deg)_brightness(0.95)_contrast(0.9)_saturate(0.6)]';

export const PIN_COLORS = {
  business: '#f59e0b',
  selected: '#f9c784',
  user: '#10b981',
};

export function createPinIcon(color: string, size = 34): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.6 2 4 5.5 4 9.9 4 15.5 12 22 12 22s8-6.5 8-12.1C20 5.5 16.4 2 12 2z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="12" cy="9.8" r="3" fill="#0f172a"/>
    </svg>`,
  });
}
