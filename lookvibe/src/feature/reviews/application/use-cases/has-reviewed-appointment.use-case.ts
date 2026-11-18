import type { ReviewedAppointmentsRegistry } from '../repositories/reviewed-appointments-registry';

export class HasReviewedAppointmentUseCase {
  constructor(private readonly registry: ReviewedAppointmentsRegistry) {}

  execute(userId: string, appointmentId: string): boolean {
    if (!userId.trim() || !appointmentId.trim()) return false;
    return this.registry.hasReviewed(userId.trim(), appointmentId.trim());
  }
}
