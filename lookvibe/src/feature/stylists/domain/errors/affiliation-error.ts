export class AffiliationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AffiliationError';
  }
}
