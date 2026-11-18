export class StylistNotFoundError extends Error {
  constructor(readonly stylistId: string) {
    super('El estilista no existe.');
    this.name = 'StylistNotFoundError';
  }
}
