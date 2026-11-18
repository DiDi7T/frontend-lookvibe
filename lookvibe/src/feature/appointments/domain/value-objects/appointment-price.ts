import { InvalidAppointmentError } from '../errors/invalid-appointment-error';

export interface AppointmentPriceInput {
  base: number | string | null;
  welcomeDiscount: number | string;
  total: number | string | null;
}

export class AppointmentPrice {
  private constructor(
    readonly base: number | null,
    readonly welcomeDiscount: number,
    readonly total: number | null,
  ) {}

  static create(input: AppointmentPriceInput): AppointmentPrice {
    const base = parseOptionalAmount(input.base, 'El precio base');
    const welcomeDiscount = parseAmount(input.welcomeDiscount, 'El descuento');
    const total = parseOptionalAmount(input.total, 'El precio total');

    if (base !== null && welcomeDiscount > base) {
      throw new InvalidAppointmentError(
        'El descuento de bienvenida no puede superar el precio base.',
      );
    }
    if (
      base !== null &&
      total !== null &&
      Math.abs(total - (base - welcomeDiscount)) > 0.01
    ) {
      throw new InvalidAppointmentError(
        'El precio total debe coincidir con el precio base menos el descuento.',
      );
    }

    return new AppointmentPrice(base, welcomeDiscount, total);
  }
}

function parseOptionalAmount(value: number | string | null, label: string): number | null {
  return value === null ? null : parseAmount(value, label);
}

function parseAmount(value: number | string, label: string): number {
  if (typeof value === 'string' && value.trim() === '') {
    throw new InvalidAppointmentError(label + ' debe ser un valor no negativo.');
  }
  const amount = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new InvalidAppointmentError(label + ' debe ser un valor no negativo.');
  }

  return amount;
}
