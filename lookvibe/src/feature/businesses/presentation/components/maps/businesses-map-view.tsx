'use client';

import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { BusinessMarker, BusinessesMapProps } from './businesses-map';
import { createPinIcon, DARK_MAP_CLASS, DEFAULT_MAP_CENTER, MAP_TILES, PIN_COLORS } from './map-config';

function initialView(markers: BusinessMarker[], userLocation: BusinessesMapProps['userLocation']) {
  if (userLocation) return { center: [userLocation.latitude, userLocation.longitude] as [number, number], zoom: 14 };
  if (markers[0]) return { center: [markers[0].latitude, markers[0].longitude] as [number, number], zoom: 12 };
  return { center: DEFAULT_MAP_CENTER, zoom: 12 };
}

export default function BusinessesMapView({ markers, userLocation }: BusinessesMapProps) {
  const businessIcon = useMemo(() => createPinIcon(PIN_COLORS.business), []);
  const userIcon = useMemo(() => createPinIcon(PIN_COLORS.user, 30), []);
  const { center, zoom } = initialView(markers, userLocation);

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className={DARK_MAP_CLASS}>
      <TileLayer {...MAP_TILES} />
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} title="Tu ubicación">
          <Popup>Estás aquí</Popup>
        </Marker>
      )}
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={businessIcon} title={marker.name}>
          <Popup>
            <div className="min-w-44 text-sm">
              <p className="font-display text-base font-bold text-slate-900">{marker.name}</p>
              <p className="mt-1 text-slate-600">{marker.address}</p>
              {marker.priceLabel && <p className="mt-1 font-semibold text-slate-900">Desde {marker.priceLabel}</p>}
              <Link href={`/businesses/${marker.id}`} className="mt-2 inline-block font-semibold text-amber-700 hover:underline">
                Ver negocio →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
