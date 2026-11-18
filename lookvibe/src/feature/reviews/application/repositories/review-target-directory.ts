import type { ReviewTargetRef } from '../../domain/value-objects/review-target-ref';

export interface ReviewTargetDirectory {
  findAll(): Promise<ReviewTargetRef[]>;
}
