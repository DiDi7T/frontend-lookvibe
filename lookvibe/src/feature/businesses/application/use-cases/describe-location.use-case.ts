import { BusinessLocation } from '../../domain/value-objects/business-location';
import type { GeocodingService } from '../repositories/geocoding-service';

export class DescribeLocationUseCase {
  constructor(private readonly geocoding: GeocodingService) {}

  async execute(input: { latitude: number; longitude: number }): Promise<string | null> {
    return this.geocoding.describe(BusinessLocation.create(input.latitude, input.longitude));
  }
}
