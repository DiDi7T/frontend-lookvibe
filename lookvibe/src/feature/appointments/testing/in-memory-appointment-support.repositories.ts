import type { AppointmentAvailabilityRepository, AvailabilitySearch } from '../application/repositories/appointment-availability-repository';
import type { BookingCatalogRepository } from '../application/repositories/booking-catalog-repository';
import type { AppointmentSlot } from '../domain/entities/appointment-slot';
import type { BookingBusiness, BookingBusinessSchedule, BookingReview, BookingStylist } from '../domain/entities/booking-business';

export class InMemoryAppointmentAvailabilityRepository implements AppointmentAvailabilityRepository {
  readonly businessSearches: Array<{ id: string; search?: AvailabilitySearch }> = [];
  readonly stylistSearches: Array<{ id: string; search?: AvailabilitySearch }> = [];

  constructor(private readonly slots: AppointmentSlot[] = []) {}

  async forBusiness(id: string, search?: AvailabilitySearch): Promise<AppointmentSlot[]> {
    this.businessSearches.push({ id, ...(search === undefined ? {} : { search }) });
    return this.slots;
  }

  async forStylist(id: string, search?: AvailabilitySearch): Promise<AppointmentSlot[]> {
    this.stylistSearches.push({ id, ...(search === undefined ? {} : { search }) });
    return this.slots;
  }
}

export class InMemoryBookingCatalogRepository implements BookingCatalogRepository {
  readonly stylistSearches: string[] = [];
  readonly reviewSearches: string[] = [];

  constructor(
    private readonly businesses: BookingBusiness[] = [],
    private readonly stylists: BookingStylist[] = [],
    private readonly reviews: BookingReview[] = [],
  ) {}

  async findBusinesses(): Promise<BookingBusiness[]> {
    return this.businesses;
  }

  async findBusinessSchedule(): Promise<BookingBusinessSchedule> {
    return { timeZone: 'America/Bogota', intervals: [] };
  }

  async findBusinessStylists(businessId: string): Promise<BookingStylist[]> {
    this.stylistSearches.push(businessId);
    return this.stylists;
  }

  async findBusinessReviews(businessId: string): Promise<BookingReview[]> {
    this.reviewSearches.push(businessId);
    return this.reviews;
  }
}
