export class InvalidAppointmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAppointmentError';
  }
}
