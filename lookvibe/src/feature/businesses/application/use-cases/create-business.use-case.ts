import type { Business } from '../../domain/entities/business';
import { BusinessDraft, type BusinessDraftInput } from '../../domain/value-objects/business-draft';
import type { BusinessRepository } from '../repositories/business-repository';

export class CreateBusinessUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(input: BusinessDraftInput): Promise<Business> {
    return this.businesses.create(BusinessDraft.create(input));
  }
}
