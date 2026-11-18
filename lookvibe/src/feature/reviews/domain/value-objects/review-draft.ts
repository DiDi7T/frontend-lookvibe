import { InvalidReviewError } from '../errors/invalid-review-error';
import { ReviewRating } from './review-rating';

export const REVIEW_COMMENT_MIN_LENGTH = 3;
export const REVIEW_COMMENT_MAX_LENGTH = 1000;

export interface ReviewDraftInput {
  appointmentId: string;
  rating: number;
  comment: string;
}

export class ReviewDraft {
  private constructor(
    readonly appointmentId: string,
    readonly rating: ReviewRating,
    readonly comment: string,
  ) {}

  static create(input: ReviewDraftInput): ReviewDraft {
    const appointmentId = input.appointmentId.trim();
    if (!appointmentId) throw new InvalidReviewError('Selecciona la cita que quieres calificar.');
    if (input.rating === 0) throw new InvalidReviewError('Elige cuántas estrellas le das al servicio.');
    const comment = input.comment.trim();
    if (comment.length < REVIEW_COMMENT_MIN_LENGTH) {
      throw new InvalidReviewError('Cuéntanos un poco más sobre tu experiencia.');
    }
    if (comment.length > REVIEW_COMMENT_MAX_LENGTH) {
      throw new InvalidReviewError(`El comentario no puede superar ${REVIEW_COMMENT_MAX_LENGTH} caracteres.`);
    }
    return new ReviewDraft(appointmentId, ReviewRating.create(input.rating), comment);
  }
}
