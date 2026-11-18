import type { Stylist } from '../../domain/entities/stylist';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';
import { StylistDraft, type StylistDraftInput } from '../../domain/value-objects/stylist-draft';
import type { StylistRepository } from '../repositories/stylist-repository';

export interface UpdateStylistInput extends StylistDraftInput {
  readonly stylistId: string;
}

export class UpdateStylistUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(input: UpdateStylistInput): Promise<Stylist> {
    const stylistId = input.stylistId.trim();
    if (!stylistId) throw new InvalidStylistError('El estilista requiere un identificador válido.');
    return this.stylists.update(stylistId, StylistDraft.create(input));
  }
}
