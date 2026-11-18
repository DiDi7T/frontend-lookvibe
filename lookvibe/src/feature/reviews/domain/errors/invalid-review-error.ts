export class InvalidReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReviewError';
  }
}
