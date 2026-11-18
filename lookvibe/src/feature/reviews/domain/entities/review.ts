import { InvalidReviewError } from '../errors/invalid-review-error';
import { ReviewRating } from '../value-objects/review-rating';

export interface ReviewInput {
  id: string;
  author: string | null;
  rating: number;
  comment: string;
  reported: boolean;
  createdAt: string;
}

export class Review {
  private constructor(
    readonly id: string,
    readonly author: string,
    readonly rating: ReviewRating,
    readonly comment: string,
    readonly reported: boolean,
    readonly createdAt: Date,
  ) {}

  static create(input: ReviewInput): Review {
    const id = input.id.trim();
    if (!id) throw new InvalidReviewError('La reseña no tiene un identificador válido.');
    const createdAt = new Date(input.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new InvalidReviewError('La fecha de la reseña no es válida.');
    return new Review(
      id,
      input.author?.trim() || 'Cliente LookVibe',
      ReviewRating.create(input.rating),
      input.comment.trim(),
      input.reported,
      createdAt,
    );
  }
}
