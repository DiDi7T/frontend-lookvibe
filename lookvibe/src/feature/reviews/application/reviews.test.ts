import { describe, expect, it } from 'vitest';
import { Review, type ReviewInput } from '../domain/entities/review';
import { InvalidReviewError } from '../domain/errors/invalid-review-error';
import { ReviewAlreadyExistsError } from '../domain/errors/review-already-exists-error';
import { ReviewDraft } from '../domain/value-objects/review-draft';
import { ModerationQueue } from '../domain/value-objects/moderation-queue';
import { ReviewManagers } from '../domain/value-objects/review-managers';
import type { ReviewTargetRef } from '../domain/value-objects/review-target-ref';
import type { ReviewRepository, ReviewTarget } from './repositories/review-repository';
import type { ReviewedAppointmentsRegistry } from './repositories/reviewed-appointments-registry';
import type { ReviewTargetDirectory } from './repositories/review-target-directory';
import { CreateReviewUseCase } from './use-cases/create-review.use-case';
import { DeleteReviewUseCase } from './use-cases/delete-review.use-case';
import { GetModerationQueueUseCase } from './use-cases/get-moderation-queue.use-case';
import { GetReviewsUseCase } from './use-cases/get-reviews.use-case';
import { HasReviewedAppointmentUseCase } from './use-cases/has-reviewed-appointment.use-case';
import { ReportReviewUseCase } from './use-cases/report-review.use-case';

const aReview = (overrides: Partial<ReviewInput> = {}) =>
  Review.create({
    id: 'r-1',
    author: 'Ana',
    rating: 5,
    comment: 'Excelente corte',
    reported: false,
    createdAt: '2026-11-10T10:00:00Z',
    ...overrides,
  });

class InMemoryReviewRepository implements ReviewRepository {
  requested: { target: ReviewTarget; id: string }[] = [];
  deleted: string[] = [];
  created: ReviewDraft[] = [];
  reported: string[] = [];

  constructor(private readonly reviews: Review[] = []) {}

  async findByTarget(target: ReviewTarget, targetId: string): Promise<Review[]> {
    this.requested.push({ target, id: targetId });
    return this.reviews;
  }

  async create(draft: ReviewDraft): Promise<void> {
    this.created.push(draft);
  }

  async report(reviewId: string): Promise<void> {
    this.reported.push(reviewId);
  }

  async delete(reviewId: string): Promise<void> {
    this.deleted.push(reviewId);
  }
}

class InMemoryReviewedAppointments implements ReviewedAppointmentsRegistry {
  private readonly reviewed = new Set<string>();

  hasReviewed(userId: string, appointmentId: string): boolean {
    return this.reviewed.has(`${userId}:${appointmentId}`);
  }

  remember(userId: string, appointmentId: string): void {
    this.reviewed.add(`${userId}:${appointmentId}`);
  }
}

describe('Review', () => {
  it('solo acepta calificaciones enteras de 1 a 5', () => {
    expect(aReview({ rating: 1 }).rating.value).toBe(1);
    expect(() => aReview({ rating: 0 })).toThrow(InvalidReviewError);
    expect(() => aReview({ rating: 6 })).toThrow(InvalidReviewError);
    expect(() => aReview({ rating: 4.5 })).toThrow(InvalidReviewError);
  });

  it('usa un autor genérico si no viene el nombre', () => {
    expect(aReview({ author: null }).author).toBe('Cliente LookVibe');
  });
});

describe('GetReviewsUseCase', () => {
  it('muestra también las reportadas hasta que el admin decida y ordena de la más reciente', async () => {
    const repository = new InMemoryReviewRepository([
      aReview({ id: 'vieja', rating: 4, createdAt: '2026-10-01T10:00:00Z' }),
      aReview({ id: 'nueva', rating: 5, createdAt: '2026-11-15T10:00:00Z' }),
      aReview({ id: 'reportada', rating: 3, reported: true, createdAt: '2026-11-01T10:00:00Z' }),
    ]);

    const summary = await new GetReviewsUseCase(repository).execute('stylist', 'e-1');

    expect(summary.reviews.map((review) => review.id)).toEqual(['nueva', 'reportada', 'vieja']);
    expect(summary.average).toBe(4);
    expect(summary.count).toBe(3);
    expect(summary.reportedCount).toBe(1);
    expect(repository.requested).toEqual([{ target: 'stylist', id: 'e-1' }]);
  });

  it('sin reseñas no hay promedio', async () => {
    const summary = await new GetReviewsUseCase(new InMemoryReviewRepository()).execute('business', 'b-1');
    expect(summary.average).toBeNull();
    expect(summary.count).toBe(0);
  });
});

describe('DeleteReviewUseCase', () => {
  it('elimina la reseña y rechaza ids vacíos', async () => {
    const repository = new InMemoryReviewRepository();
    const useCase = new DeleteReviewUseCase(repository);
    await useCase.execute('r-9');
    expect(repository.deleted).toEqual(['r-9']);
    await expect(useCase.execute(' ')).rejects.toThrow(InvalidReviewError);
  });
});

describe('ReviewDraft', () => {
  const valid = { appointmentId: 'c-1', rating: 4, comment: '  Muy buen servicio  ' };

  it('limpia el comentario y conserva la calificación', () => {
    const draft = ReviewDraft.create(valid);
    expect(draft.comment).toBe('Muy buen servicio');
    expect(draft.rating.value).toBe(4);
  });

  it('exige cita, estrellas y un comentario entre 3 y 1000 caracteres', () => {
    expect(() => ReviewDraft.create({ ...valid, appointmentId: ' ' })).toThrow(InvalidReviewError);
    expect(() => ReviewDraft.create({ ...valid, rating: 0 })).toThrow('Elige cuántas estrellas');
    expect(() => ReviewDraft.create({ ...valid, comment: 'ok' })).toThrow(InvalidReviewError);
    expect(() => ReviewDraft.create({ ...valid, comment: 'x'.repeat(1001) })).toThrow(InvalidReviewError);
  });
});

describe('CreateReviewUseCase', () => {
  it('publica la reseña de la cita y la recuerda como calificada', async () => {
    const repository = new InMemoryReviewRepository();
    const registry = new InMemoryReviewedAppointments();
    const useCase = new CreateReviewUseCase(repository, registry);

    await useCase.execute({ userId: 'u-1', appointmentId: 'c-1', rating: 5, comment: 'Excelente' });

    expect(repository.created).toHaveLength(1);
    expect(repository.created[0].appointmentId).toBe('c-1');
    expect(new HasReviewedAppointmentUseCase(registry).execute('u-1', 'c-1')).toBe(true);
    expect(new HasReviewedAppointmentUseCase(registry).execute('u-2', 'c-1')).toBe(false);
  });

  it('no deja calificar dos veces la misma cita', async () => {
    const repository = new InMemoryReviewRepository();
    const useCase = new CreateReviewUseCase(repository, new InMemoryReviewedAppointments());
    const input = { userId: 'u-1', appointmentId: 'c-1', rating: 5, comment: 'Excelente' };

    await useCase.execute(input);
    await expect(useCase.execute(input)).rejects.toThrow(ReviewAlreadyExistsError);
    expect(repository.created).toHaveLength(1);
  });

  it('no envía nada si la reseña es inválida o no hay sesión', async () => {
    const repository = new InMemoryReviewRepository();
    const useCase = new CreateReviewUseCase(repository, new InMemoryReviewedAppointments());

    await expect(useCase.execute({ userId: 'u-1', appointmentId: 'c-1', rating: 6, comment: 'Excelente' })).rejects.toThrow(InvalidReviewError);
    await expect(useCase.execute({ userId: ' ', appointmentId: 'c-1', rating: 5, comment: 'Excelente' })).rejects.toThrow(InvalidReviewError);
    expect(repository.created).toHaveLength(0);
  });
});

describe('ReportReviewUseCase', () => {
  it('reporta la reseña y rechaza ids vacíos', async () => {
    const repository = new InMemoryReviewRepository();
    const useCase = new ReportReviewUseCase(repository);
    await useCase.execute(' r-3 ');
    expect(repository.reported).toEqual(['r-3']);
    await expect(useCase.execute('')).rejects.toThrow(InvalidReviewError);
  });
});

describe('ReviewManagers', () => {
  it('reconoce a la cuenta del estilista y al dueño de su negocio', () => {
    const managers = ReviewManagers.create({ userIds: ['u-estilista', null, 'u-dueno'], businessId: 'b-1' });
    expect(managers.includes('u-estilista')).toBe(true);
    expect(managers.includes('u-dueno')).toBe(true);
    expect(managers.includes('otro')).toBe(false);
  });

  it('reconoce al dueño por los negocios que administra', () => {
    const managers = ReviewManagers.create({ userIds: [], businessId: 'b-1' });
    expect(managers.includes('u-dueno', ['b-1'])).toBe(true);
    expect(managers.includes('u-dueno', ['b-2'])).toBe(false);
    expect(ReviewManagers.create({ userIds: [] }).includes('u-dueno', ['b-1'])).toBe(false);
  });
});

describe('ModerationQueue', () => {
  const business: ReviewTargetRef = { kind: 'business', id: 'b-1', name: 'Zen Spa' };
  const stylist: ReviewTargetRef = { kind: 'stylist', id: 'e-1', name: 'Valentina' };

  it('pone primero las reportadas, sin repetir reseñas y priorizando el negocio', () => {
    const shared = aReview({ id: 'compartida', createdAt: '2026-11-01T10:00:00Z' });
    const queue = ModerationQueue.from([
      { target: stylist, reviews: [shared] },
      { target: business, reviews: [shared, aReview({ id: 'reportada', reported: true, createdAt: '2026-10-01T10:00:00Z' })] },
    ]);

    expect(queue.items.map((item) => item.review.id)).toEqual(['reportada', 'compartida']);
    expect(queue.items[1].target).toEqual(business);
    expect(queue.reported.map((item) => item.review.id)).toEqual(['reportada']);
    expect(queue.without('reportada').items).toHaveLength(1);
  });
});

describe('GetModerationQueueUseCase', () => {
  it('reúne las reseñas de todos los negocios y estilistas', async () => {
    const directory: ReviewTargetDirectory = {
      findAll: async () => [
        { kind: 'business', id: 'b-1', name: 'Zen Spa' },
        { kind: 'stylist', id: 'e-1', name: 'Valentina' },
      ],
    };
    const repository = new InMemoryReviewRepository([aReview({ id: 'r-1', reported: true })]);

    const queue = await new GetModerationQueueUseCase(repository, directory).execute();

    expect(repository.requested).toEqual([
      { target: 'business', id: 'b-1' },
      { target: 'stylist', id: 'e-1' },
    ]);
    expect(queue.reported).toHaveLength(1);
  });
});
