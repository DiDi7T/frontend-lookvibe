import { describe, expect, it } from 'vitest';
import { Appointment } from './entities/appointment';
import { AppointmentSlot } from './entities/appointment-slot';
import { InvalidAppointmentError } from './errors/invalid-appointment-error';
import { AppointmentDateTime } from './value-objects/appointment-date-time';
import { AppointmentDuration } from './value-objects/appointment-duration';
import { AppointmentPrice } from './value-objects/appointment-price';
import { AppointmentStatus } from './value-objects/appointment-status';
import { AppointmentTarget } from './value-objects/appointment-target';

describe('appointment value objects', () => {
  it('normalizes dates to ISO and returns a defensive Date copy', () => {
    const dateTime = AppointmentDateTime.create('2026-05-20T10:00:00-05:00');
    const date = dateTime.toDate();
    date.setUTCFullYear(2030);

    expect(dateTime.isoValue).toBe('2026-05-20T15:00:00.000Z');
    expect(dateTime.toDate().getUTCFullYear()).toBe(2026);
  });

  it('rejects invalid dates and durations outside the allowed range', () => {
    expect(() => AppointmentDateTime.create('not-a-date')).toThrow(InvalidAppointmentError);
    expect(AppointmentDuration.create(1).minutes).toBe(1);
    expect(AppointmentDuration.create(1440).minutes).toBe(1440);
    expect(() => AppointmentDuration.create(0)).toThrow(InvalidAppointmentError);
    expect(() => AppointmentDuration.create(1.5)).toThrow(InvalidAppointmentError);
  });

  it('requires an appointment target and trims valid resource IDs', () => {
    expect(AppointmentTarget.create({ businessId: ' business-1 ' })).toMatchObject({ businessId: 'business-1', stylistId: null });
    expect(AppointmentTarget.create({ stylistId: ' stylist-1 ' })).toMatchObject({ businessId: null, stylistId: 'stylist-1' });
    expect(AppointmentTarget.create({ businessId: ' business-1 ', stylistId: ' stylist-1 ' })).toMatchObject({
      businessId: 'business-1',
      stylistId: 'stylist-1',
    });
    expect(() => AppointmentTarget.create({})).toThrow(InvalidAppointmentError);
    expect(() => AppointmentTarget.create({ businessId: '  ' })).toThrow(InvalidAppointmentError);
  });

  it('parses prices and rejects inconsistent totals or discounts', () => {
    expect(AppointmentPrice.create({ base: '45000.00', welcomeDiscount: '5000', total: '40000' })).toMatchObject({
      base: 45000,
      welcomeDiscount: 5000,
      total: 40000,
    });
    expect(() => AppointmentPrice.create({ base: 100, welcomeDiscount: 101, total: 0 })).toThrow(InvalidAppointmentError);
    expect(() => AppointmentPrice.create({ base: 100, welcomeDiscount: 10, total: 95 })).toThrow(InvalidAppointmentError);
    expect(() => AppointmentPrice.create({ base: -1, welcomeDiscount: 0, total: -1 })).toThrow(InvalidAppointmentError);
  });

  it('accepts only known appointment states', () => {
    expect(AppointmentStatus.create('pendiente').value).toBe('pendiente');
    expect(() => AppointmentStatus.create('reservada')).toThrow(InvalidAppointmentError);
  });

  it('validates slot ordering and defaults to the business timezone', () => {
    const slot = AppointmentSlot.create({
      startsAt: '2026-05-20T15:00:00Z',
      endsAt: '2026-05-20T15:45:00Z',
      available: true,
    });

    expect(slot.timeZone).toBe('America/Bogota');
    expect(slot.available).toBe(true);
    expect(() => AppointmentSlot.create({
      startsAt: '2026-05-20T15:45:00Z',
      endsAt: '2026-05-20T15:00:00Z',
      available: true,
    })).toThrow(InvalidAppointmentError);
  });
});

describe('Appointment entity', () => {
  const validAppointment = {
    id: 'appointment-1',
    userId: 'client-1',
    serviceId: 'service-1',
    businessId: 'business-1',
    stylistId: null,
    startsAt: '2026-05-20T15:00:00Z',
    durationMinutes: 45,
    price: { base: 45000, welcomeDiscount: 5000, total: 40000 },
    status: 'pendiente',
    note: null,
    createdAt: '2026-05-01T12:00:00Z',
    updatedAt: '2026-05-01T12:00:00Z',
  };

  it('creates a valid appointment and retains summary data', () => {
    const appointment = Appointment.create({
      ...validAppointment,
      clientName: 'Ana Cliente',
      serviceSummary: { id: 'service-1', name: 'Corte', price: 45000, durationMinutes: 45 },
      welcomeBenefitApplied: true,
    });

    expect(appointment).toMatchObject({
      clientName: 'Ana Cliente',
      serviceId: 'service-1',
      duration: { minutes: 45 },
      price: { total: 40000 },
      serviceSummary: { name: 'Corte' },
      welcomeBenefitApplied: true,
    });
  });

  it('rejects missing identifiers, long notes, and reversed timestamps', () => {
    expect(() => Appointment.create({ ...validAppointment, id: ' ' })).toThrow(InvalidAppointmentError);
    expect(Appointment.create({ ...validAppointment, businessId: null }).target).toBeNull();
    expect(() => Appointment.create({ ...validAppointment, note: 'x'.repeat(501) })).toThrow(InvalidAppointmentError);
    expect(() => Appointment.create({ ...validAppointment, updatedAt: '2026-04-30T12:00:00Z' })).toThrow(InvalidAppointmentError);
  });

  it('allows persisted appointments whose related business and stylist were removed', () => {
    const appointment = Appointment.create({ ...validAppointment, businessId: null, stylistId: null });
    expect(appointment.target).toBeNull();
  });
});
