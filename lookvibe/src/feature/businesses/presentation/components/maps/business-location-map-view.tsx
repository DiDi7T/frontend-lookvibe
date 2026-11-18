'use client';

import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import type { BusinessLocationMapProps } from './business-location-map';
import { createPinIcon, DARK_MAP_CLASS, MAP_TILES, PIN_COLORS } from './map-config';

export default function BusinessLocationMapView({ name, latitude, longitude }: BusinessLocationMapProps) {
  const icon = useMemo(() => createPinIcon(PIN_COLORS.business, 40), []);

  return (
    <MapContainer center={[latitude, longitude]} zoom={16} scrollWheelZoom={false} className={DARK_MAP_CLASS}>
      <TileLayer {...MAP_TILES} />
      <Marker position={[latitude, longitude]} icon={icon} title={name} />
    </MapContainer>
  );
}
