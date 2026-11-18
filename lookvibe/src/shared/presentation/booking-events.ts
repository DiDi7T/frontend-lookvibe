export const NEW_BOOKING_EVENT = 'lookvibe-start-new-booking';
export const APPOINTMENT_CANCELLED_EVENT = 'lookvibe-appointment-cancelled';

export function dispatchNewBookingStarted(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NEW_BOOKING_EVENT));
}

export function dispatchAppointmentCancelled(appointmentId: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APPOINTMENT_CANCELLED_EVENT, { detail: { appointmentId } }));
  }
}
