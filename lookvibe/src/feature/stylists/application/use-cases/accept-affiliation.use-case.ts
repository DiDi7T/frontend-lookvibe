import type { Stylist } from '../../domain/entities/stylist';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';
import { AffiliationCode } from '../../domain/value-objects/affiliation-code';
import type { StylistRepository } from '../repositories/stylist-repository';

export interface AcceptAffiliationInput {
  readonly businessId: string;
  readonly stylistCode: string;
}

export class AcceptAffiliationUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(input: AcceptAffiliationInput): Promise<Stylist> {
    const businessId = input.businessId.trim();
    if (!businessId) throw new InvalidStylistError('El negocio requiere un identificador válido.');
    const stylistCode = AffiliationCode.create(input.stylistCode, 'código del estilista');
    return this.stylists.acceptAffiliation(businessId, stylistCode.value);
  }
}
