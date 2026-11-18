import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import type { AddressSuggestion } from '../../domain/value-objects/address-suggestion';
import type { GeocodingService } from '../repositories/geocoding-service';

const MIN_QUERY_LENGTH = 4;

export class SearchAddressUseCase {
  constructor(private readonly geocoding: GeocodingService) {}

  async execute(query: string): Promise<AddressSuggestion[]> {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) {
      throw new InvalidBusinessError('Escribe una dirección más completa para buscarla en el mapa.');
    }
    return this.geocoding.search(text);
  }
}
