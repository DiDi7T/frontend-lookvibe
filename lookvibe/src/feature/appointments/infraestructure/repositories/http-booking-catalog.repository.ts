import type { BookingCatalogRepository } from '../../application/repositories/booking-catalog-repository';
import type { BookingBusinessDto, BookingBusinessScheduleDto } from '../dtos/booking-catalog.dto';
import type { BookingReviewDto } from '../dtos/booking-review.dto';
import { HttpError, type HttpClient } from '../../../../shared/infrastructure/http-client';
import type { BookingBusiness, BookingBusinessSchedule, BookingStylist } from '../../domain/entities/booking-business';
import type { BookingReview } from '../../domain/entities/booking-business';

export class HttpBookingCatalogRepository implements BookingCatalogRepository {
  constructor(private readonly http: HttpClient) {}

  async findBusinesses(): Promise<BookingBusiness[]> {
    const businesses = await this.http.get<BookingBusinessDto[]>('/negocios');
    return businesses.map((business) => ({
        id: business.id,
        name: business.nombre,
        description: business.descripcion ?? null,
        address: business.direccion ?? null,
        services: (business.servicios ?? []).map((service) => ({
          id: service.id,
          name: service.nombre,
          price: Number(service.precio),
          durationMinutes: service.duracionMin,
        })),
        stylists: (business.estilistas ?? []).map((stylist) => ({
          id: stylist.id,
          name: stylist.usuario?.nombre ?? null,
          specialty: stylist.especialidad,
        })),
      }));
  }

  async findBusinessSchedule(businessId: string): Promise<BookingBusinessSchedule> {
    const encodedBusinessId = encodeURIComponent(businessId);
    let schedule: BookingBusinessScheduleDto;
    try {
      schedule = await this.http.get<BookingBusinessScheduleDto>(
        `/appointments/negocios/${encodedBusinessId}/horarios`,
      );
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
      schedule = await this.http.get<BookingBusinessScheduleDto>(
        `/citas/negocios/${encodedBusinessId}/horarios`,
      );
    }
    return {
      timeZone: schedule.zonaHoraria,
      intervals: schedule.horarios.map((interval) => ({
        dayOfWeek: interval.diaSemana,
        startTime: interval.horaInicio,
        endTime: interval.horaFin,
      })),
    };
  }

  async findBusinessStylists(businessId: string): Promise<BookingStylist[]> {
    const stylists = await this.http.get<BookingBusinessDto['estilistas']>(
      `/negocios/${encodeURIComponent(businessId)}/estilistas`,
    );
    return (stylists ?? []).map((stylist) => ({
      id: stylist.id,
      name: stylist.usuario?.nombre?.trim() || null,
      specialty: stylist.especialidad,
    }));
  }

  async findBusinessReviews(businessId: string): Promise<BookingReview[]> {
    const reviews = await this.http.get<BookingReviewDto[]>(
      `/negocios/${encodeURIComponent(businessId)}/rese%C3%B1as`,
    );
    return reviews.filter((review) => review.reportado !== true).map((review) => ({
      id: review.id,
      author: review.usuario?.nombre ?? 'Cliente LookVibe',
      rating: review.calificacion,
      comment: review.comentario,
      createdAt: review.createdAt,
    }));
  }
}
