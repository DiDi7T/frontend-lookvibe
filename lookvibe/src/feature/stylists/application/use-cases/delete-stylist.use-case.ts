import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';
import type { StylistRepository } from '../repositories/stylist-repository';

export class DeleteStylistUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(stylistId: string): Promise<void> {
    const id = stylistId.trim();
    if (!id) throw new InvalidStylistError('El estilista requiere un identificador válido.');
    await this.stylists.delete(id);
  }
}
