export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super('Ya calificaste esta cita. ¡Gracias por tu reseña!');
    this.name = 'ReviewAlreadyExistsError';
  }
}
