import { InvalidAppointmentError } from '../errors/invalid-appointment-error';

export interface AppointmentTargetInput {
  businessId?: string | null;
  stylistId?: string | null;
}

export class AppointmentTarget {
  private constructor(
    readonly businessId: string | null,
    readonly stylistId: string | null,
  ) {}

  static create(input: AppointmentTargetInput): AppointmentTarget {
    const businessId = normalizeId(input.businessId);
    const stylistId = normalizeId(input.stylistId);

    if (!businessId && !stylistId) {
      throw new InvalidAppointmentError(
        'La cita debe estar asociada a un negocio o a un estilista.',
      );
    }

    return new AppointmentTarget(businessId, stylistId);
  }
}

function normalizeId(id: string | null | undefined): string | null {
  if (id === null || id === undefined) return null;
  const normalized = id.trim();

  if (!normalized) {
    throw new InvalidAppointmentError('El identificador del recurso no es válido.');
  }

  return normalized;
}
