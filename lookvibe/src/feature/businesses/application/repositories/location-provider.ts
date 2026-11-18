import type { BusinessLocation } from '../../domain/value-objects/business-location';

export interface LocationProvider {
  getCurrentLocation(): Promise<BusinessLocation>;
}
