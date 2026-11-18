import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import { BusinessSchedule, type ScheduleIntervalInput } from '../../domain/value-objects/business-schedule';
import type { BusinessRepository } from '../repositories/business-repository';

export interface SaveBusinessScheduleInput {
  readonly businessId: string;
  readonly intervals: ScheduleIntervalInput[];
}

export class SaveBusinessScheduleUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(input: SaveBusinessScheduleInput): Promise<void> {
    const id = input.businessId.trim();
    if (!id) throw new InvalidBusinessError('El negocio requiere un identificador válido.');
    return this.businesses.saveSchedule(id, BusinessSchedule.create(input.intervals));
  }
}
