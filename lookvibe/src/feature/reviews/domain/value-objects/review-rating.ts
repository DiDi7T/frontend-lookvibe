import { InvalidReviewError } from '../errors/invalid-review-error';

export class ReviewRating {
  private constructor(readonly value: number) {}

  static create(value: number): ReviewRating {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new InvalidReviewError('La calificación debe ser un número entero entre 1 y 5.');
    }
    return new ReviewRating(value);
  }
}
