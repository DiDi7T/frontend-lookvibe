import type { Stylist } from '../../domain/entities/stylist';
import { StylistNotFoundError } from '../../domain/errors/stylist-not-found-error';
import type { StylistRepository } from '../repositories/stylist-repository';

export class GetStylistUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(stylistId: string): Promise<Stylist> {
    const id = stylistId.trim();
    if (!id) throw new StylistNotFoundError(stylistId);
    return this.stylists.findById(id);
  }
}
