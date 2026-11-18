import type { BookingBusiness, BookingBusinessSchedule, BookingReview, BookingStylist } from '../../domain/entities/booking-business';

export interface BookingCatalogRepository {
  findBusinesses(): Promise<BookingBusiness[]>;
  findBusinessSchedule(businessId: string): Promise<BookingBusinessSchedule>;
  findBusinessStylists(businessId: string): Promise<BookingStylist[]>;
  findBusinessReviews(businessId: string): Promise<BookingReview[]>;
}
