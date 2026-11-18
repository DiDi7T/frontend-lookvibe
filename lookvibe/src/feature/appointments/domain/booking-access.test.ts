import { describe, expect, it } from 'vitest';
import { canAccessAppointments, canBookAppointments } from './value-objects/booking-access';

describe('canBookAppointments', () => {
  it('solo las cuentas de cliente pueden reservar', () => {
    expect(canBookAppointments(['cliente'])).toBe(true);
    expect(canBookAppointments(['negocio'])).toBe(false);
    expect(canBookAppointments(['estilista'])).toBe(false);
    expect(canBookAppointments(['admin'])).toBe(false);
    expect(canBookAppointments(null)).toBe(false);
  });
});

describe('canAccessAppointments', () => {
  it('el admin no ve ni gestiona citas; clientes, negocios y estilistas sí', () => {
    expect(canAccessAppointments(['cliente'])).toBe(true);
    expect(canAccessAppointments(['negocio'])).toBe(true);
    expect(canAccessAppointments(['estilista'])).toBe(true);
    expect(canAccessAppointments(['admin'])).toBe(false);
    expect(canAccessAppointments(undefined)).toBe(false);
  });
});
