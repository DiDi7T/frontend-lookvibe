'use client';

import dynamic from 'next/dynamic';
import { MapErrorBoundary } from './map-error-boundary';
import { MapLoading } from './map-loading';

export interface BusinessLocationMapProps {
  name: string;
  latitude: number;
  longitude: number;
}

const BusinessLocationMapView = dynamic(() => import('./business-location-map-view'), { ssr: false, loading: MapLoading });

export function BusinessLocationMap(props: BusinessLocationMapProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}`;

  return (
    <div className="space-y-3">
      <div className="relative z-0 h-64 overflow-hidden rounded-3xl border border-white/10">
        <MapErrorBoundary>
          <BusinessLocationMapView {...props} />
        </MapErrorBoundary>
      </div>
      <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-[#f9c784] hover:underline">
        Cómo llegar →
      </a>
    </div>
  );
}
