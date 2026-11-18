import { InvalidReviewError } from '../../domain/errors/invalid-review-error';
import { ReviewSummary } from '../../domain/value-objects/review-summary';
import type { ReviewRepository, ReviewTarget } from '../repositories/review-repository';

export class GetReviewsUseCase {
  constructor(private readonly reviews: ReviewRepository) {}

  async execute(target: ReviewTarget, targetId: string): Promise<ReviewSummary> {
    const id = targetId.trim();
    if (!id) throw new InvalidReviewError('Indica de quién quieres ver las reseñas.');
    return ReviewSummary.from(await this.reviews.findByTarget(target, id));
  }
}
