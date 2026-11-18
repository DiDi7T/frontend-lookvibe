import type { Stylist } from '../../domain/entities/stylist';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';
import { StylistDraft, type StylistDraftInput } from '../../domain/value-objects/stylist-draft';
import type { StylistRepository } from '../repositories/stylist-repository';

export interface CreateStylistInput extends StylistDraftInput {
  readonly businessId: string;
}

export class CreateStylistUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(input: CreateStylistInput): Promise<Stylist> {
    const businessId = input.businessId.trim();
    if (!businessId) throw new InvalidStylistError('El estilista debe pertenecer a un negocio.');
    return this.stylists.createForBusiness(businessId, StylistDraft.create(input));
  }
}
