import { describe, expect, it } from 'vitest';
import { InvalidBusinessError } from '../domain/errors/invalid-business-error';
import { AddressSuggestion } from '../domain/value-objects/address-suggestion';
import type { BusinessLocation } from '../domain/value-objects/business-location';
import { normalizeAddressQuery } from '../infraestructure/mappers/nominatim.mapper';
import type { GeocodingService } from './repositories/geocoding-service';
import { DescribeLocationUseCase } from './use-cases/describe-location.use-case';
import { SearchAddressUseCase } from './use-cases/search-address.use-case';

class FakeGeocodingService implements GeocodingService {
  queries: string[] = [];
  described: BusinessLocation[] = [];

  async search(query: string): Promise<AddressSuggestion[]> {
    this.queries.push(query);
    return [AddressSuggestion.create({ label: 'Carrera 39', detail: 'Santa Isabel, Cali', latitude: 3.4249, longitude: -76.5496 })];
  }

  async describe(location: BusinessLocation): Promise<string | null> {
    this.described.push(location);
    return 'Calle 18A, Manuel María Buenaventura, Cali';
  }
}

describe('SearchAddressUseCase', () => {
  it('busca la dirección limpia y devuelve sugerencias con ubicación', async () => {
    const geocoding = new FakeGeocodingService();
    const results = await new SearchAddressUseCase(geocoding).execute('  Carrera 39 44-61, Cali ');
    expect(geocoding.queries).toEqual(['Carrera 39 44-61, Cali']);
    expect(results[0].location.latitude).toBe(3.4249);
  });

  it('no consulta el servicio con textos demasiado cortos', async () => {
    const geocoding = new FakeGeocodingService();
    await expect(new SearchAddressUseCase(geocoding).execute('cr')).rejects.toThrow(InvalidBusinessError);
    expect(geocoding.queries).toHaveLength(0);
  });
});

describe('DescribeLocationUseCase', () => {
  it('describe un punto válido y rechaza coordenadas fuera de rango', async () => {
    const geocoding = new FakeGeocodingService();
    const useCase = new DescribeLocationUseCase(geocoding);
    expect(await useCase.execute({ latitude: 3.4372, longitude: -76.5225 })).toContain('Calle 18A');
    await expect(useCase.execute({ latitude: 120, longitude: 0 })).rejects.toThrow(InvalidBusinessError);
  });
});

describe('AddressSuggestion', () => {
  it('no existe sin descripción', () => {
    expect(() => AddressSuggestion.create({ label: ' ', detail: '', latitude: 3.4, longitude: -76.5 })).toThrow(InvalidBusinessError);
  });
});

describe('normalizeAddressQuery', () => {
  it('expande abreviaturas colombianas y limpia el numeral', () => {
    expect(normalizeAddressQuery('cr 39 # 44 - 61, Cali')).toBe('Carrera 39 44-61, Cali');
    expect(normalizeAddressQuery('Cll 5 No. 38-14')).toBe('Calle 5 38-14');
    expect(normalizeAddressQuery('Av. 6N # 23-45')).toBe('Avenida 6N 23-45');
    expect(normalizeAddressQuery('Barrio Buenos Aires')).toBe('Barrio Buenos Aires');
  });
});
