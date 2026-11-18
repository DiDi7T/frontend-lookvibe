import type { ReviewTarget } from '../../application/repositories/review-repository';
import { Review } from '../../domain/entities/review';
import type { ReviewDraft } from '../../domain/value-objects/review-draft';
import type { CreateReviewRequestDto, ReviewDto } from '../dtos/review.dto';

export const REVIEWS_RESOURCE = '/rese%C3%B1as';

export function reviewToDomain(dto: ReviewDto): Review {
  return Review.create({
    id: dto.id,
    author: dto.usuario?.nombre ?? null,
    rating: dto.calificacion,
    comment: dto.comentario,
    reported: dto.reportado,
    createdAt: dto.createdAt,
  });
}

export function reviewDraftToDto(draft: ReviewDraft): CreateReviewRequestDto {
  return {
    citaId: draft.appointmentId,
    calificacion: draft.rating.value,
    comentario: draft.comment,
  };
}

export function reviewsPath(target: ReviewTarget, targetId: string): string {
  const resource = target === 'business' ? 'negocios' : 'estilistas';
  return `/${resource}/${encodeURIComponent(targetId)}${REVIEWS_RESOURCE}`;
}

export function reviewPath(reviewId: string): string {
  return `${REVIEWS_RESOURCE}/${encodeURIComponent(reviewId)}`;
}
