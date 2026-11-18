import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';
import { AppointmentDuration } from '../../domain/value-objects/appointment-duration';
import type {
  AppointmentAvailabilityRepository,
  AvailabilitySearch,
} from '../repositories/appointment-availability-repository';

export type AvailabilityTarget =
  | { readonly type: 'business'; readonly id: string }
  | { readonly type: 'stylist'; readonly id: string };

export interface GetAvailabilityInput {
  readonly target: AvailabilityTarget;
  readonly date?: string;
  readonly durationMinutes?: number;
  readonly stepMinutes?: number;
}

export class GetAvailabilityUseCase {
  constructor(private readonly availability: AppointmentAvailabilityRepository) {}

  execute(input: GetAvailabilityInput): Promise<AppointmentSlot[]> {
    const id = requireId(input.target.id);
    const search: AvailabilitySearch = {
      ...(input.date ? { date: validateDate(input.date) } : {}),
      ...(input.durationMinutes === undefined
        ? {}
        : { duration: AppointmentDuration.create(input.durationMinutes) }),
      ...(input.stepMinutes === undefined
        ? {}
        : { step: AppointmentDuration.create(input.stepMinutes) }),
    };

    const hasSearchCriteria = Object.keys(search).length > 0;
    const searchCriteria = hasSearchCriteria ? search : undefined;

    return input.target.type === 'business'
      ? this.availability.forBusiness(id, searchCriteria)
      : this.availability.forStylist(id, searchCriteria);
  }
}

function requireId(id: string): string {
  const value = id.trim();
  if (!value) throw new InvalidAppointmentError('El recurso requiere un identificador válido.');
  return value;
}

function validateDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InvalidAppointmentError('La fecha debe tener el formato YYYY-MM-DD.');
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new InvalidAppointmentError('La fecha indicada no es válida.');
  }
  return value;
}
