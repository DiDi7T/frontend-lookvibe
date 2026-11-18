export class StylistProfileExistsError extends Error {
  constructor() {
    super('Tu cuenta ya tiene un perfil de estilista.');
    this.name = 'StylistProfileExistsError';
  }
}
