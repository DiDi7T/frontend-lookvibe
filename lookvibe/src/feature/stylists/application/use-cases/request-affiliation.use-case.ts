import type { Stylist } from '../../domain/entities/stylist';
import { AffiliationError } from '../../domain/errors/affiliation-error';
import { AffiliationCode } from '../../domain/value-objects/affiliation-code';
import type { StylistRepository } from '../repositories/stylist-repository';

export interface RequestAffiliationInput {
  readonly stylistId: string;
  readonly businessCode: string;
}

export class RequestAffiliationUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(input: RequestAffiliationInput): Promise<Stylist> {
    const businessCode = AffiliationCode.create(input.businessCode, 'código de invitación del negocio');
    const stylist = await this.stylists.findById(input.stylistId.trim());
    if (!stylist.canRequestAffiliation) {
      throw new AffiliationError(
        stylist.business
          ? `Ya perteneces a ${stylist.business.name}.`
          : 'Solo un estilista con cuenta propia puede unirse a un negocio con un código.',
      );
    }
    return this.stylists.requestAffiliation(stylist.id, businessCode.value);
  }
}
