export class InvalidBusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBusinessError';
  }
}
