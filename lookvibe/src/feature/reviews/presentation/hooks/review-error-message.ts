import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import { InvalidReviewError } from '../../domain/errors/invalid-review-error';
import { ReviewAlreadyExistsError } from '../../domain/errors/review-already-exists-error';

export function toReviewErrorMessage(reason: unknown, fallback: string): string {
  if (reason instanceof InvalidReviewError || reason instanceof ReviewAlreadyExistsError) return reason.message;
  return toHttpErrorMessage(reason, 'La reseña o la cita ya no existe.') ?? fallback;
}
