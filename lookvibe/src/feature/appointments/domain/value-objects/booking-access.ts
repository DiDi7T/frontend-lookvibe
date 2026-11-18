import type { AppRole } from '../../../auth/domain/value-objects/app-role';

export const BOOKING_ROLES: readonly AppRole[] = ['cliente'];

export function canBookAppointments(roles: readonly string[] | null | undefined): boolean {
  return roles?.some((role) => BOOKING_ROLES.some((allowed) => allowed === role)) ?? false;
}

export const APPOINTMENT_ROLES: readonly AppRole[] = ['cliente', 'negocio', 'estilista'];

export function canAccessAppointments(roles: readonly string[] | null | undefined): boolean {
  return roles?.some((role) => APPOINTMENT_ROLES.some((allowed) => allowed === role)) ?? false;
}
