import { InvalidReviewError } from '../../domain/errors/invalid-review-error';
import type { ReviewRepository } from '../repositories/review-repository';

export class ReportReviewUseCase {
  constructor(private readonly reviews: ReviewRepository) {}

  async execute(reviewId: string): Promise<void> {
    const id = reviewId.trim();
    if (!id) throw new InvalidReviewError('La reseña requiere un identificador válido.');
    await this.reviews.report(id);
  }
}
