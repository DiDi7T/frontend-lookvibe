import type { Review } from '../entities/review';

export class ReviewSummary {
  private constructor(
    readonly reviews: readonly Review[],
    readonly average: number | null,
  ) {}

  static from(reviews: readonly Review[]): ReviewSummary {
    const newestFirst = [...reviews].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    const total = newestFirst.reduce((sum, review) => sum + review.rating.value, 0);
    const average = newestFirst.length ? Math.round((total / newestFirst.length) * 10) / 10 : null;
    return new ReviewSummary(newestFirst, average);
  }

  get count(): number {
    return this.reviews.length;
  }

  get reportedCount(): number {
    return this.reviews.filter((review) => review.reported).length;
  }
}
