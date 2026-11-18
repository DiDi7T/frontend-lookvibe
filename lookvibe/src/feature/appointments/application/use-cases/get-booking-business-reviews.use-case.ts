import type { BookingReviewsSummary } from '../../domain/entities/booking-business';
import type { BookingCatalogRepository } from '../repositories/booking-catalog-repository';

export class GetBookingBusinessReviewsUseCase {
  constructor(private readonly catalog: BookingCatalogRepository) {}

  async execute(businessId: string): Promise<BookingReviewsSummary> {
    const reviews = await this.catalog.findBusinessReviews(businessId);
    return {
      businessId,
      average: reviews.length
        ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
        : null,
      count: reviews.length,
      reviews,
    };
  }
}
