import { InvalidBusinessError } from '../errors/invalid-business-error';

const EARTH_RADIUS_KM = 6371;

export class BusinessLocation {
  private constructor(
    readonly latitude: number,
    readonly longitude: number,
  ) {}

  static create(latitude: number, longitude: number): BusinessLocation {
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new InvalidBusinessError('La latitud debe estar entre -90 y 90.');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new InvalidBusinessError('La longitud debe estar entre -180 y 180.');
    }
    return new BusinessLocation(latitude, longitude);
  }

  static fromOptional(latitude: number | null, longitude: number | null): BusinessLocation | null {
    if (latitude === null && longitude === null) return null;
    if (latitude === null || longitude === null) {
      throw new InvalidBusinessError('La ubicación necesita latitud y longitud.');
    }
    return BusinessLocation.create(latitude, longitude);
  }

  distanceKmTo(other: BusinessLocation): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const deltaLatitude = toRadians(other.latitude - this.latitude);
    const deltaLongitude = toRadians(other.longitude - this.longitude);
    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(toRadians(this.latitude)) * Math.cos(toRadians(other.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  }
}
