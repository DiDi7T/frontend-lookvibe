import { InvalidStylistError } from '../errors/invalid-stylist-error';

export const AFFILIATION_STATUSES = ['INDEPENDIENTE', 'PENDIENTE', 'AFILIADO'] as const;

export type AffiliationStatusValue = (typeof AFFILIATION_STATUSES)[number];

export class AffiliationStatus {
  private constructor(readonly value: AffiliationStatusValue) {}

  static create(value: string): AffiliationStatus {
    const status = AFFILIATION_STATUSES.find((candidate) => candidate === value);
    if (!status) throw new InvalidStylistError('El estado de afiliación no es válido.');
    return new AffiliationStatus(status);
  }
}
