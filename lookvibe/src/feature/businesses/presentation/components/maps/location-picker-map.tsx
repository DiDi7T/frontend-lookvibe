'use client';

import 'leaflet/dist/leaflet.css';
import type { LeafletEvent, Marker as LeafletMarker } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Coordinates } from '../../hooks/use-current-location';
import { createPinIcon, DARK_MAP_CLASS, DEFAULT_MAP_CENTER, MAP_TILES, PIN_COLORS } from './map-config';

interface LocationPickerMapProps {
  value: Coordinates | null;
  focus: Coordinates | null;
  onChange: (value: Coordinates) => void;
}

function PickOnClick({ onChange }: { onChange: (value: Coordinates) => void }) {
  useMapEvents({
    click: (event) => onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

function FlyToFocus({ focus }: { focus: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.latitude, focus.longitude], 17);
  }, [map, focus]);
  return null;
}

export default function LocationPickerMap({ value, focus, onChange }: LocationPickerMapProps) {
  const icon = useMemo(() => createPinIcon(PIN_COLORS.business, 40), []);
  const center = value ? ([value.latitude, value.longitude] as [number, number]) : DEFAULT_MAP_CENTER;

  function move(event: LeafletEvent) {
    const position = (event.target as LeafletMarker).getLatLng();
    onChange({ latitude: position.lat, longitude: position.lng });
  }

  return (
    <MapContainer center={center} zoom={value ? 16 : 12} scrollWheelZoom className={DARK_MAP_CLASS}>
      <TileLayer {...MAP_TILES} />
      <PickOnClick onChange={onChange} />
      <FlyToFocus focus={focus} />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={icon}
          draggable
          eventHandlers={{ dragend: move }}
          title="Ubicación del negocio"
        />
      )}
    </MapContainer>
  );
}
