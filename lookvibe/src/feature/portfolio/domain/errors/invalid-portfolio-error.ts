export class InvalidPortfolioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPortfolioError';
  }
}
