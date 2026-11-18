import type { AddressSuggestion } from '../../domain/value-objects/address-suggestion';
import type { BusinessLocation } from '../../domain/value-objects/business-location';

export interface GeocodingService {
  search(query: string): Promise<AddressSuggestion[]>;
  describe(location: BusinessLocation): Promise<string | null>;
}
