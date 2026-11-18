import type { LocationProvider } from '../../application/repositories/location-provider';
import { LocationUnavailableError } from '../../domain/errors/location-unavailable-error';
import { BusinessLocation } from '../../domain/value-objects/business-location';

export class BrowserLocationProvider implements LocationProvider {
  getCurrentLocation(): Promise<BusinessLocation> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new LocationUnavailableError('Tu navegador no permite compartir la ubicación.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(BusinessLocation.create(position.coords.latitude, position.coords.longitude)),
        (error) => reject(new LocationUnavailableError(
          error.code === error.PERMISSION_DENIED
            ? 'Necesitamos permiso para usar tu ubicación. Actívalo en el navegador.'
            : undefined,
        )),
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    });
  }
}
