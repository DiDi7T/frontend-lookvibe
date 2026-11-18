import type { Business } from '../../domain/entities/business';
import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import { BusinessDraft, type BusinessDraftInput } from '../../domain/value-objects/business-draft';
import type { BusinessRepository } from '../repositories/business-repository';

export interface UpdateBusinessInput extends BusinessDraftInput {
  readonly id: string;
}

export class UpdateBusinessUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(input: UpdateBusinessInput): Promise<Business> {
    const id = input.id.trim();
    if (!id) throw new InvalidBusinessError('El negocio requiere un identificador válido.');
    return this.businesses.update(id, BusinessDraft.create(input));
  }
}
