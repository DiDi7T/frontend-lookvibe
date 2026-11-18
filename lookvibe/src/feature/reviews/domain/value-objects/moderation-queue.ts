import type { Review } from '../entities/review';
import type { ReviewTargetRef } from './review-target-ref';

export interface ModerationItem {
  readonly review: Review;
  readonly target: ReviewTargetRef;
}

export class ModerationQueue {
  private constructor(readonly items: readonly ModerationItem[]) {}

  static from(groups: readonly { target: ReviewTargetRef; reviews: readonly Review[] }[]): ModerationQueue {
    const byId = new Map<string, ModerationItem>();
    for (const { target, reviews } of groups) {
      for (const review of reviews) {
        const current = byId.get(review.id);
        if (!current || (current.target.kind === 'stylist' && target.kind === 'business')) {
          byId.set(review.id, { review, target });
        }
      }
    }
    const items = [...byId.values()].sort((left, right) => {
      if (left.review.reported !== right.review.reported) return left.review.reported ? -1 : 1;
      return right.review.createdAt.getTime() - left.review.createdAt.getTime();
    });
    return new ModerationQueue(items);
  }

  get reported(): readonly ModerationItem[] {
    return this.items.filter((item) => item.review.reported);
  }

  without(reviewId: string): ModerationQueue {
    return new ModerationQueue(this.items.filter((item) => item.review.id !== reviewId));
  }
}
