import { InvalidBusinessError } from '../errors/invalid-business-error';

export interface BusinessServiceSummaryInput {
  id: string;
  name: string;
  price: number | string;
  durationMinutes: number;
}

export class BusinessServiceSummary {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly price: number,
    readonly durationMinutes: number,
  ) {}

  static create(input: BusinessServiceSummaryInput): BusinessServiceSummary {
    const price = typeof input.price === 'number' ? input.price : Number(input.price);
    if (!input.id.trim() || !input.name.trim()) {
      throw new InvalidBusinessError('Un servicio del negocio no tiene datos válidos.');
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new InvalidBusinessError('El precio de un servicio del negocio no es válido.');
    }
    if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1) {
      throw new InvalidBusinessError('La duración de un servicio del negocio no es válida.');
    }
    return new BusinessServiceSummary(input.id, input.name.trim(), price, input.durationMinutes);
  }
}
