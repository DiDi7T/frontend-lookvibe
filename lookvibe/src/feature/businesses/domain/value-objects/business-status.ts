import { InvalidBusinessError } from '../errors/invalid-business-error';

export const BUSINESS_STATUSES = ['EN_CONFIGURACION', 'ACTIVO'] as const;

export type BusinessStatusValue = (typeof BUSINESS_STATUSES)[number];

export class BusinessStatus {
  private constructor(readonly value: BusinessStatusValue) {}

  static create(value: string): BusinessStatus {
    const status = BUSINESS_STATUSES.find((candidate) => candidate === value);
    if (!status) {
      throw new InvalidBusinessError('El estado del negocio no es válido.');
    }
    return new BusinessStatus(status);
  }

  get isActive(): boolean {
    return this.value === 'ACTIVO';
  }
}
