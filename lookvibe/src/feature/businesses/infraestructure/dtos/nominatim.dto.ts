export interface NominatimAddressDto {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
}

export interface NominatimPlaceDto {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddressDto;
}
