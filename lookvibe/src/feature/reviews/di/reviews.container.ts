import { sharedContainer } from '../../../shared/di/shared.container';
import { CreateReviewUseCase } from '../application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from '../application/use-cases/delete-review.use-case';
import { GetReviewsUseCase } from '../application/use-cases/get-reviews.use-case';
import { HasReviewedAppointmentUseCase } from '../application/use-cases/has-reviewed-appointment.use-case';
import { ReportReviewUseCase } from '../application/use-cases/report-review.use-case';
import { HttpReviewRepository } from '../infraestructure/repositories/http-review.repository';
import { LocalStorageReviewedAppointmentsRegistry } from '../infraestructure/repositories/local-storage-reviewed-appointments.registry';

const reviewRepository = new HttpReviewRepository(sharedContainer.http);
const reviewedAppointments = new LocalStorageReviewedAppointmentsRegistry();

export const reviewsContainer = {
  getReviews: new GetReviewsUseCase(reviewRepository),
  createReview: new CreateReviewUseCase(reviewRepository, reviewedAppointments),
  hasReviewedAppointment: new HasReviewedAppointmentUseCase(reviewedAppointments),
  reportReview: new ReportReviewUseCase(reviewRepository),
  deleteReview: new DeleteReviewUseCase(reviewRepository),
};
