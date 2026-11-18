'use client';

import dynamic from 'next/dynamic';
import { MapErrorBoundary } from './map-error-boundary';
import { MapLoading } from './map-loading';

export interface BusinessMarker {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLabel: string | null;
}

export interface BusinessesMapProps {
  markers: BusinessMarker[];
  userLocation: { latitude: number; longitude: number } | null;
}

const BusinessesMapView = dynamic(() => import('./businesses-map-view'), { ssr: false, loading: MapLoading });

export function BusinessesMap(props: BusinessesMapProps) {
  return (
    <div className="relative z-0 h-full w-full">
      <MapErrorBoundary>
        <BusinessesMapView {...props} />
      </MapErrorBoundary>
    </div>
  );
}
