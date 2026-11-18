import type { ReviewTarget } from '../../application/repositories/review-repository';

export interface ReviewTargetRef {
  readonly kind: ReviewTarget;
  readonly id: string;
  readonly name: string;
}
