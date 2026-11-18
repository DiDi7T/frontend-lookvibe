import { ModerationQueue } from '../../domain/value-objects/moderation-queue';
import type { ReviewRepository } from '../repositories/review-repository';
import type { ReviewTargetDirectory } from '../repositories/review-target-directory';

export class GetModerationQueueUseCase {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly directory: ReviewTargetDirectory,
  ) {}

  async execute(): Promise<ModerationQueue> {
    const targets = await this.directory.findAll();
    const groups = await Promise.all(
      targets.map(async (target) => ({
        target,
        reviews: await this.reviews.findByTarget(target.kind, target.id).catch(() => []),
      })),
    );
    return ModerationQueue.from(groups);
  }
}
