import { sharedContainer } from '../../../shared/di/shared.container';
import { HttpAppointmentAvailabilityRepository } from '../infraestructure/repositories/http-appointment-availability.repository';
import { HttpAppointmentRepository } from '../infraestructure/repositories/http-appointment.repository';
import { HttpBookingCatalogRepository } from '../infraestructure/repositories/http-booking-catalog.repository';
import { CancelAppointmentUseCase } from '../application/use-cases/cancel-appointment.use-case';
import { CreateAppointmentUseCase } from '../application/use-cases/create-appointment.use-case';
import { GetAppointmentUseCase } from '../application/use-cases/get-appointment.use-case';
import { GetAppointmentsUseCase } from '../application/use-cases/get-appointments.use-case';
import { GetAvailabilityUseCase } from '../application/use-cases/get-availability.use-case';
import { RescheduleAppointmentUseCase } from '../application/use-cases/reschedule-appointment.use-case';
import { SetAppointmentOutcomeUseCase } from '../application/use-cases/set-appointment-outcome.use-case';
import { GetBookingBusinessesUseCase } from '../application/use-cases/get-booking-businesses.use-case';
import { GetBookingBusinessReviewsUseCase } from '../application/use-cases/get-booking-business-reviews.use-case';
import { GetBookingBusinessStylistsUseCase } from '../application/use-cases/get-booking-business-stylists.use-case';
import { GetBookingBusinessScheduleUseCase } from '../application/use-cases/get-booking-business-schedule.use-case';

const appointmentRepository = new HttpAppointmentRepository(sharedContainer.http);
const availabilityRepository = new HttpAppointmentAvailabilityRepository(sharedContainer.http);
const bookingCatalogRepository = new HttpBookingCatalogRepository(sharedContainer.http);

export const appointmentsContainer = {
  appointmentRepository,
  availabilityRepository,
  bookingCatalogRepository,
  getBookingBusinesses: new GetBookingBusinessesUseCase(bookingCatalogRepository),
  getBookingBusinessReviews: new GetBookingBusinessReviewsUseCase(bookingCatalogRepository),
  getBookingBusinessStylists: new GetBookingBusinessStylistsUseCase(bookingCatalogRepository),
  getBookingBusinessSchedule: new GetBookingBusinessScheduleUseCase(bookingCatalogRepository),
  getAppointments: new GetAppointmentsUseCase(appointmentRepository),
  getAppointment: new GetAppointmentUseCase(appointmentRepository),
  getAvailability: new GetAvailabilityUseCase(availabilityRepository),
  createAppointment: new CreateAppointmentUseCase(appointmentRepository),
  rescheduleAppointment: new RescheduleAppointmentUseCase(appointmentRepository),
  cancelAppointment: new CancelAppointmentUseCase(appointmentRepository),
  setAppointmentOutcome: new SetAppointmentOutcomeUseCase(appointmentRepository),
};
