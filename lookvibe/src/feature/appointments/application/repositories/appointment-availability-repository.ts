import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import type { AppointmentDuration } from '../../domain/value-objects/appointment-duration';

export interface AvailabilitySearch {
  readonly date?: string;
  readonly duration?: AppointmentDuration;
  readonly step?: AppointmentDuration;
}

export interface AppointmentAvailabilityRepository {
  forBusiness(
    businessId: string,
    search?: AvailabilitySearch,
  ): Promise<AppointmentSlot[]>;
  forStylist(
    stylistId: string,
    search?: AvailabilitySearch,
  ): Promise<AppointmentSlot[]>;
}
