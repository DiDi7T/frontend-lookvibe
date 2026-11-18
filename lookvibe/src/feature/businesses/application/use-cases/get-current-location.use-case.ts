import type { BusinessLocation } from '../../domain/value-objects/business-location';
import type { LocationProvider } from '../repositories/location-provider';

export class GetCurrentLocationUseCase {
  constructor(private readonly locationProvider: LocationProvider) {}

  execute(): Promise<BusinessLocation> {
    return this.locationProvider.getCurrentLocation();
  }
}
