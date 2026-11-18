import type { BookingBusinessSchedule } from '../../domain/entities/booking-business';
import type { BookingCatalogRepository } from '../repositories/booking-catalog-repository';

export class GetBookingBusinessScheduleUseCase {
  constructor(private readonly catalog: BookingCatalogRepository) {}

  execute(businessId: string): Promise<BookingBusinessSchedule> {
    return this.catalog.findBusinessSchedule(businessId);
  }
}
