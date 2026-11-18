export class BusinessNotFoundError extends Error {
  constructor(readonly businessId: string) {
    super('El negocio no existe o todavía no está disponible.');
    this.name = 'BusinessNotFoundError';
  }
}
