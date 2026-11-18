export class InvalidStylistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStylistError';
  }
}
