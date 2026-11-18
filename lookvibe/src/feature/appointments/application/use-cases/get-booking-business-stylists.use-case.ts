import type { BookingStylist } from '../../domain/entities/booking-business';
import type { BookingCatalogRepository } from '../repositories/booking-catalog-repository';

export class GetBookingBusinessStylistsUseCase {
  constructor(private readonly catalog: BookingCatalogRepository) {}

  execute(businessId: string): Promise<BookingStylist[]> {
    return this.catalog.findBusinessStylists(businessId);
  }
}
