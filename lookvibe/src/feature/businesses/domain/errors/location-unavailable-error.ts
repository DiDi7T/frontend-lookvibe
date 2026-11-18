export class LocationUnavailableError extends Error {
  constructor(message = 'No pudimos obtener tu ubicación. Revisa el permiso del navegador.') {
    super(message);
    this.name = 'LocationUnavailableError';
  }
}
