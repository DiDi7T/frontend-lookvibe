export interface ReviewedAppointmentsRegistry {
  hasReviewed(userId: string, appointmentId: string): boolean;
  remember(userId: string, appointmentId: string): void;
}
