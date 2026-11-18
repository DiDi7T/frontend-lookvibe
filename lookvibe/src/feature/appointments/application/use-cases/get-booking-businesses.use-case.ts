import type { BookingBusiness } from '../../domain/entities/booking-business';
import type { BookingCatalogRepository } from '../repositories/booking-catalog-repository';

export class GetBookingBusinessesUseCase {
  constructor(private readonly catalog: BookingCatalogRepository) {}

  execute(): Promise<BookingBusiness[]> {
    return this.catalog.findBusinesses();
  }
}
