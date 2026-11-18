import { AddressSuggestion } from '../../domain/value-objects/address-suggestion';
import type { NominatimPlaceDto } from '../dtos/nominatim.dto';

const STREET_ABBREVIATIONS: [RegExp, string][] = [
  [/\b(?:cra|kra|cr|kr|carr)\.?(?=\s|\d|$)/gi, 'Carrera'],
  [/\b(?:cll|cl|calle)\.?(?=\s|\d|$)/gi, 'Calle'],
  [/\b(?:av|avda)\.?(?=\s|\d|$)/gi, 'Avenida'],
  [/\b(?:tv|tr|trans|transv)\.?(?=\s|\d|$)/gi, 'Transversal'],
  [/\b(?:dg|diag)\.?(?=\s|\d|$)/gi, 'Diagonal'],
];

export function normalizeAddressQuery(query: string): string {
  let text = query.replace(/\s*(?:#|\bno\.|\bn[º°])\s*/gi, ' ').replace(/\s*-\s*/g, '-');
  for (const [pattern, replacement] of STREET_ABBREVIATIONS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s+/g, ' ').trim();
}

export function placeToSuggestion(place: NominatimPlaceDto): AddressSuggestion {
  const address = place.address ?? {};
  const street = [address.road, address.house_number].filter(Boolean).join(' ');
  const area = [address.neighbourhood ?? address.suburb, address.city ?? address.town ?? address.village]
    .filter(Boolean)
    .join(', ');
  return AddressSuggestion.create({
    label: street || place.name || place.display_name.split(',')[0],
    detail: area || place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  });
}

export function placeToAddressLine(place: NominatimPlaceDto): string {
  const suggestion = placeToSuggestion(place);
  return suggestion.detail ? `${suggestion.label}, ${suggestion.detail}` : suggestion.label;
}
