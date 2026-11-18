import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { GeocodingService } from '../../application/repositories/geocoding-service';
import type { AddressSuggestion } from '../../domain/value-objects/address-suggestion';
import type { BusinessLocation } from '../../domain/value-objects/business-location';
import type { NominatimPlaceDto } from '../dtos/nominatim.dto';
import { normalizeAddressQuery, placeToAddressLine, placeToSuggestion } from '../mappers/nominatim.mapper';

const CALI_VIEWBOX = '-76.60,3.52,-76.45,3.33';

export class NominatimGeocodingService implements GeocodingService {
  constructor(private readonly http: HttpClient) {}

  async search(query: string): Promise<AddressSuggestion[]> {
    const params = new URLSearchParams({
      q: normalizeAddressQuery(query),
      format: 'jsonv2',
      addressdetails: '1',
      countrycodes: 'co',
      viewbox: CALI_VIEWBOX,
      limit: '5',
      'accept-language': 'es',
    });
    const places = await this.http.get<NominatimPlaceDto[]>(`/search?${params.toString()}`);
    return places.map(placeToSuggestion);
  }

  async describe(location: BusinessLocation): Promise<string | null> {
    const params = new URLSearchParams({
      lat: String(location.latitude),
      lon: String(location.longitude),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18',
      'accept-language': 'es',
    });
    const place = await this.http.get<NominatimPlaceDto | { error: string }>(`/reverse?${params.toString()}`);
    return 'display_name' in place ? placeToAddressLine(place) : null;
  }
}
