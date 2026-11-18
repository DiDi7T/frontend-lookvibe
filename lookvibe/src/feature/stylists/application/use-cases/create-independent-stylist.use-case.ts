import type { Stylist } from '../../domain/entities/stylist';
import { StylistDraft, type StylistDraftInput } from '../../domain/value-objects/stylist-draft';
import type { StylistProfileRegistry } from '../repositories/stylist-profile-registry';
import type { StylistRepository } from '../repositories/stylist-repository';

export interface CreateIndependentStylistInput extends StylistDraftInput {
  readonly userId: string;
}

export class CreateIndependentStylistUseCase {
  constructor(
    private readonly stylists: StylistRepository,
    private readonly registry: StylistProfileRegistry,
  ) {}

  async execute(input: CreateIndependentStylistInput): Promise<Stylist> {
    const stylist = await this.stylists.createIndependent(StylistDraft.create(input));
    if (input.userId.trim()) this.registry.rememberProfileId(input.userId.trim(), stylist.id);
    return stylist;
  }
}
