import type { ReviewedAppointmentsRegistry } from '../../application/repositories/reviewed-appointments-registry';

const KEY_PREFIX = 'lookvibe_reviewed_appointments_';

export class LocalStorageReviewedAppointmentsRegistry implements ReviewedAppointmentsRegistry {
  hasReviewed(userId: string, appointmentId: string): boolean {
    return this.read(userId).includes(appointmentId);
  }

  remember(userId: string, appointmentId: string): void {
    if (typeof window === 'undefined') return;
    const reviewed = this.read(userId);
    if (reviewed.includes(appointmentId)) return;
    try {
      window.localStorage.setItem(KEY_PREFIX + userId, JSON.stringify([...reviewed, appointmentId]));
    } catch {
      return;
    }
  }

  private read(userId: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(KEY_PREFIX + userId) ?? '[]');
      return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [];
    } catch {
      return [];
    }
  }
}
