import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { ReviewRepository, ReviewTarget } from '../../application/repositories/review-repository';
import type { Review } from '../../domain/entities/review';
import type { ReviewDraft } from '../../domain/value-objects/review-draft';
import type { ReviewDto } from '../dtos/review.dto';
import { REVIEWS_RESOURCE, reviewDraftToDto, reviewPath, reviewsPath, reviewToDomain } from '../mappers/review.mapper';

export class HttpReviewRepository implements ReviewRepository {
  constructor(private readonly http: HttpClient) {}

  async findByTarget(target: ReviewTarget, targetId: string): Promise<Review[]> {
    const reviews = await this.http.get<ReviewDto[]>(reviewsPath(target, targetId));
    return reviews.map(reviewToDomain);
  }

  async create(draft: ReviewDraft): Promise<void> {
    await this.http.post<ReviewDto>(REVIEWS_RESOURCE, reviewDraftToDto(draft));
  }

  async report(reviewId: string): Promise<void> {
    await this.http.patch<ReviewDto>(`${reviewPath(reviewId)}/reportar`, {});
  }

  async delete(reviewId: string): Promise<void> {
    await this.http.delete(reviewPath(reviewId));
  }
}
