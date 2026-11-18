import { InvalidBusinessError } from '../errors/invalid-business-error';
import { BusinessLocation } from '../value-objects/business-location';
import { BusinessServiceSummary, type BusinessServiceSummaryInput } from '../value-objects/business-service-summary';
import { BusinessStatus } from '../value-objects/business-status';

export interface BusinessInput {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  services: BusinessServiceSummaryInput[];
  stylistCount: number;
}

export class Business {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly address: string | null,
    readonly location: BusinessLocation | null,
    readonly status: BusinessStatus,
    readonly services: readonly BusinessServiceSummary[],
    readonly stylistCount: number,
  ) {}

  static create(input: BusinessInput): Business {
    const id = input.id.trim();
    if (!id) throw new InvalidBusinessError('El negocio no tiene un identificador válido.');

    const name = input.name.trim();
    if (!name) throw new InvalidBusinessError('El negocio debe tener un nombre.');

    if (!Number.isInteger(input.stylistCount) || input.stylistCount < 0) {
      throw new InvalidBusinessError('El total de estilistas no es válido.');
    }

    return new Business(
      id,
      name,
      input.description?.trim() || null,
      input.address?.trim() || null,
      BusinessLocation.fromOptional(input.latitude, input.longitude),
      BusinessStatus.create(input.status),
      input.services
        .map((service) => BusinessServiceSummary.create(service))
        .sort((left, right) => left.price - right.price),
      input.stylistCount,
    );
  }

  get serviceCount(): number {
    return this.services.length;
  }

  get startingPrice(): number | null {
    return this.services[0]?.price ?? null;
  }

  get isBookable(): boolean {
    return this.status.isActive && this.serviceCount > 0;
  }

  get missingSetup(): string[] {
    const missing: string[] = [];
    if (!this.location) missing.push('ubicación');
    if (this.serviceCount === 0) missing.push('servicios');
    if (this.stylistCount === 0) missing.push('estilistas');
    return missing;
  }

  matches(query: string): boolean {
    const text = query.trim().toLocaleLowerCase('es');
    if (!text) return true;
    return [this.name, this.address ?? '', this.description ?? '']
      .some((value) => value.toLocaleLowerCase('es').includes(text));
  }

  hasServiceUpTo(maxPrice: number): boolean {
    return this.services.some((service) => service.price <= maxPrice);
  }

  distanceKmFrom(point: BusinessLocation): number | null {
    return this.location ? this.location.distanceKmTo(point) : null;
  }
}
