import { InvalidReviewError } from '../../domain/errors/invalid-review-error';
import { ReviewAlreadyExistsError } from '../../domain/errors/review-already-exists-error';
import { ReviewDraft, type ReviewDraftInput } from '../../domain/value-objects/review-draft';
import type { ReviewRepository } from '../repositories/review-repository';
import type { ReviewedAppointmentsRegistry } from '../repositories/reviewed-appointments-registry';

export interface CreateReviewInput extends ReviewDraftInput {
  userId: string;
}

export class CreateReviewUseCase {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly registry: ReviewedAppointmentsRegistry,
  ) {}

  async execute(input: CreateReviewInput): Promise<void> {
    const userId = input.userId.trim();
    if (!userId) throw new InvalidReviewError('Inicia sesión para calificar tu cita.');
    const draft = ReviewDraft.create(input);
    if (this.registry.hasReviewed(userId, draft.appointmentId)) throw new ReviewAlreadyExistsError();
    await this.reviews.create(draft);
    this.registry.remember(userId, draft.appointmentId);
  }
}
