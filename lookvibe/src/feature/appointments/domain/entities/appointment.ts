import { InvalidAppointmentError } from '../errors/invalid-appointment-error';
import { AppointmentDateTime } from '../value-objects/appointment-date-time';
import { AppointmentDuration } from '../value-objects/appointment-duration';
import { AppointmentPrice, type AppointmentPriceInput } from '../value-objects/appointment-price';
import { AppointmentStatus } from '../value-objects/appointment-status';
import { AppointmentTarget, type AppointmentTargetInput } from '../value-objects/appointment-target';

export interface AppointmentInput {
  id: string;
  userId: string;
  clientName?: string | null;
  serviceId: string;
  businessId: string | null;
  stylistId: string | null;
  startsAt: string | Date;
  durationMinutes: number;
  price: AppointmentPriceInput;
  status: string;
  note: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  businessSummary?: AppointmentBusinessSummary | null;
  serviceSummary?: AppointmentServiceSummary | null;
  stylistSummary?: AppointmentStylistSummary | null;
  welcomeBenefitApplied?: boolean;
}

export interface AppointmentBusinessSummary {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
}

export interface AppointmentServiceSummary {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly durationMinutes: number;
}

export interface AppointmentStylistSummary {
  readonly id: string;
  readonly photoUrl: string | null;
  readonly specialty: string;
  readonly affiliationStatus?: 'INDEPENDIENTE' | 'PENDIENTE' | 'AFILIADO';
}

export class Appointment {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly clientName: string | null,
    readonly serviceId: string,
    readonly target: AppointmentTarget | null,
    readonly startsAt: AppointmentDateTime,
    readonly duration: AppointmentDuration,
    readonly price: AppointmentPrice,
    readonly status: AppointmentStatus,
    readonly note: string | null,
    readonly createdAt: AppointmentDateTime,
    readonly updatedAt: AppointmentDateTime,
    readonly businessSummary: AppointmentBusinessSummary | null,
    readonly serviceSummary: AppointmentServiceSummary | null,
    readonly stylistSummary: AppointmentStylistSummary | null,
    readonly welcomeBenefitApplied: boolean,
  ) {}

  static create(input: AppointmentInput): Appointment {
    const id = requireId(input.id, 'La cita');
    const userId = requireId(input.userId, 'El usuario');
    const serviceId = requireId(input.serviceId, 'El servicio');
    const target = createExistingTarget(input.businessId, input.stylistId);
    const note = normalizeNote(input.note);

    const startsAt = AppointmentDateTime.create(input.startsAt);
    const createdAt = AppointmentDateTime.create(input.createdAt);
    const updatedAt = AppointmentDateTime.create(input.updatedAt);

    if (updatedAt.toDate().getTime() < createdAt.toDate().getTime()) {
      throw new InvalidAppointmentError(
        'La fecha de actualización no puede ser anterior a la creación.',
      );
    }

    return new Appointment(
      id,
      userId,
      input.clientName ?? null,
      serviceId,
      target,
      startsAt,
      AppointmentDuration.create(input.durationMinutes),
      AppointmentPrice.create(input.price),
      AppointmentStatus.create(input.status),
      note,
      createdAt,
      updatedAt,
      input.businessSummary ?? null,
      input.serviceSummary ?? null,
      input.stylistSummary ?? null,
      input.welcomeBenefitApplied ?? false,
    );
  }
}

function requireId(value: string, label: string): string {
  const id = value.trim();
  if (!id) throw new InvalidAppointmentError(label + ' no tiene un identificador válido.');
  return id;
}

function createExistingTarget(
  businessId: string | null,
  stylistId: string | null,
): AppointmentTarget | null {
  if (businessId === null && stylistId === null) return null;

  const input: AppointmentTargetInput = { businessId, stylistId };
  return AppointmentTarget.create(input);
}

function normalizeNote(note: string | null): string | null {
  if (note === null) return null;
  if (note.length > 500) {
    throw new InvalidAppointmentError('La nota de la cita no puede superar 500 caracteres.');
  }
  return note;
}
