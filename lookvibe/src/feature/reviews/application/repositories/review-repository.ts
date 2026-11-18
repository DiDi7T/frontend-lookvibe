import type { Review } from '../../domain/entities/review';
import type { ReviewDraft } from '../../domain/value-objects/review-draft';

export type ReviewTarget = 'business' | 'stylist';

export interface ReviewRepository {
  findByTarget(target: ReviewTarget, targetId: string): Promise<Review[]>;
  create(draft: ReviewDraft): Promise<void>;
  report(reviewId: string): Promise<void>;
  delete(reviewId: string): Promise<void>;
}
