export interface BookingBusiness {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly address: string | null;
  readonly services: readonly BookingService[];
  readonly stylists: readonly BookingStylist[];
}

export interface BookingBusinessSchedule {
  readonly timeZone: string;
  readonly intervals: readonly BookingBusinessScheduleInterval[];
}

export interface BookingBusinessScheduleInterval {
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
}

export interface BookingReview {
  readonly id: string;
  readonly author: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string;
}

export interface BookingReviewsSummary {
  readonly businessId: string;
  readonly average: number | null;
  readonly count: number;
  readonly reviews: readonly BookingReview[];
}

export interface BookingService {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly durationMinutes: number;
}

export interface BookingStylist {
  readonly id: string;
  readonly name: string | null;
  readonly specialty: string;
}
