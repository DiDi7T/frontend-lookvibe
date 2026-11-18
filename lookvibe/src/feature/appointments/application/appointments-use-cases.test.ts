import { describe, expect, it } from 'vitest';
import { InvalidAppointmentError } from '../domain/errors/invalid-appointment-error';
import type { BookingBusiness, BookingReview, BookingStylist } from '../domain/entities/booking-business';
import { InMemoryAppointmentRepository, anAppointment } from '../testing/in-memory-appointment.repository';
import {
  InMemoryAppointmentAvailabilityRepository,
  InMemoryBookingCatalogRepository,
} from '../testing/in-memory-appointment-support.repositories';
import { CancelAppointmentUseCase } from './use-cases/cancel-appointment.use-case';
import { CreateAppointmentUseCase } from './use-cases/create-appointment.use-case';
import { GetAppointmentUseCase } from './use-cases/get-appointment.use-case';
import { GetAppointmentsUseCase } from './use-cases/get-appointments.use-case';
import { GetAvailabilityUseCase } from './use-cases/get-availability.use-case';
import { GetBookingBusinessReviewsUseCase } from './use-cases/get-booking-business-reviews.use-case';
import { GetBookingBusinessStylistsUseCase } from './use-cases/get-booking-business-stylists.use-case';
import { GetBookingBusinessesUseCase } from './use-cases/get-booking-businesses.use-case';
import { RescheduleAppointmentUseCase } from './use-cases/reschedule-appointment.use-case';
import { SetAppointmentOutcomeUseCase } from './use-cases/set-appointment-outcome.use-case';

describe('appointment query use cases', () => {
  it('gets appointments and trims IDs when looking up one appointment', async () => {
    const appointment = anAppointment();
    const repository = new InMemoryAppointmentRepository([appointment]);

    await expect(new GetAppointmentsUseCase(repository).execute()).resolves.toEqual([appointment]);
    await expect(new GetAppointmentUseCase(repository).execute(' appointment-1 ')).resolves.toBe(appointment);
    await expect(new GetAppointmentUseCase(repository).execute('missing')).rejects.toThrow(InvalidAppointmentError);
    await expect(new GetAppointmentUseCase(repository).execute('  ')).rejects.toThrow(InvalidAppointmentError);
  });

  it('validates availability search and delegates to the selected resource repository', async () => {
    const repository = new InMemoryAppointmentAvailabilityRepository();
    const useCase = new GetAvailabilityUseCase(repository);

    await useCase.execute({
      target: { type: 'business', id: ' business-1 ' },
      date: '2026-05-20',
      durationMinutes: 45,
      stepMinutes: 15,
    });
    await useCase.execute({ target: { type: 'stylist', id: 'stylist-1' } });

    expect(repository.businessSearches).toHaveLength(1);
    expect(repository.businessSearches[0].id).toBe('business-1');
    expect(repository.businessSearches[0].search).toMatchObject({
      date: '2026-05-20',
      duration: { minutes: 45 },
      step: { minutes: 15 },
    });
    expect(repository.stylistSearches).toEqual([{ id: 'stylist-1' }]);
  });

  it('rejects invalid availability inputs before reaching the repository', async () => {
    const repository = new InMemoryAppointmentAvailabilityRepository();
    const useCase = new GetAvailabilityUseCase(repository);

    expect(() => useCase.execute({ target: { type: 'business', id: ' ' } })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ target: { type: 'business', id: 'business-1' }, date: '2026-02-30' }))
      .toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ target: { type: 'stylist', id: 'stylist-1' }, durationMinutes: 0 }))
      .toThrow(InvalidAppointmentError);
    expect(repository.businessSearches).toHaveLength(0);
    expect(repository.stylistSearches).toHaveLength(0);
  });
});

describe('appointment command use cases', () => {
  it('validates and creates an appointment for a business or stylist', async () => {
    const repository = new InMemoryAppointmentRepository();
    const useCase = new CreateAppointmentUseCase(repository);
    const created = await useCase.execute({
      userId: ' client-1 ',
      serviceId: ' service-1 ',
      businessId: ' business-1 ',
      startsAt: '2026-05-20T10:00:00-05:00',
      note: '  Primera visita  ',
    });

    expect(repository.created[0]).toMatchObject({
      userId: 'client-1',
      serviceId: 'service-1',
      target: { businessId: 'business-1', stylistId: null },
      startsAt: { isoValue: '2026-05-20T15:00:00.000Z' },
      note: '  Primera visita  ',
    });
    expect(created.status.value).toBe('pendiente');

    await useCase.execute({ userId: 'client-1', serviceId: 'service-1', stylistId: 'stylist-1', startsAt: '2026-05-21T15:00:00Z' });
    expect(repository.created[1].target).toMatchObject({ businessId: null, stylistId: 'stylist-1' });
  });

  it('rejects invalid create data without calling the repository', async () => {
    const repository = new InMemoryAppointmentRepository();
    const useCase = new CreateAppointmentUseCase(repository);

    expect(() => useCase.execute({ userId: ' ', serviceId: 'service-1', businessId: 'business-1', startsAt: '2026-05-20T15:00:00Z' }))
      .toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ userId: 'client-1', serviceId: 'service-1', startsAt: '2026-05-20T15:00:00Z' }))
      .toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ userId: 'client-1', serviceId: 'service-1', businessId: 'business-1', startsAt: 'bad date' }))
      .toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ userId: 'client-1', serviceId: 'service-1', businessId: 'business-1', startsAt: '2026-05-20T15:00:00Z', note: 'x'.repeat(501) }))
      .toThrow(InvalidAppointmentError);
    expect(repository.created).toHaveLength(0);
  });

  it('validates cancellation and records the reason', async () => {
    const repository = new InMemoryAppointmentRepository();
    const useCase = new CancelAppointmentUseCase(repository);

    await useCase.execute({ id: ' appointment-1 ', reason: 'Cambio de planes' });
    expect(repository.cancelled).toEqual([{ id: 'appointment-1', reason: 'Cambio de planes' }]);
    expect(() => useCase.execute({ id: ' ' })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: 'appointment-1', reason: 'x'.repeat(501) })).toThrow(InvalidAppointmentError);
    expect(repository.cancelled).toHaveLength(1);
  });

  it('requires at least one valid change when rescheduling', async () => {
    const appointment = anAppointment();
    const repository = new InMemoryAppointmentRepository([appointment]);
    const useCase = new RescheduleAppointmentUseCase(repository);

    await useCase.execute({ id: ' appointment-1 ', startsAt: '2026-05-22T10:00:00-05:00' });
    expect(repository.rescheduled[0]).toMatchObject({
      id: 'appointment-1',
      changes: { startsAt: { isoValue: '2026-05-22T15:00:00.000Z' } },
    });
    expect(() => useCase.execute({ id: 'appointment-1' })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: ' ', note: null })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: 'appointment-1', serviceId: '  ' })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: 'appointment-1', note: 'x'.repeat(501) })).toThrow(InvalidAppointmentError);
    expect(repository.rescheduled).toHaveLength(1);
  });

  it('sets completed and not-realized outcomes, rejecting invalid inputs', async () => {
    const repository = new InMemoryAppointmentRepository([anAppointment()]);
    const now = new Date('2026-11-18T15:00:00.000Z');
    const useCase = new SetAppointmentOutcomeUseCase(repository, () => now);
    const startsAt = new Date('2026-11-18T14:00:00.000Z');

    await useCase.execute({ id: ' appointment-1 ', completed: true, startsAt });
    await useCase.execute({ id: 'appointment-1', completed: false, startsAt: now });
    expect(repository.completions).toEqual([
      { id: 'appointment-1', completed: true },
      { id: 'appointment-1', completed: false },
    ]);
    expect(() => useCase.execute({ id: ' ', completed: true, startsAt })).toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: 'appointment-1', completed: 'yes' as unknown as boolean, startsAt }))
      .toThrow(InvalidAppointmentError);
    expect(repository.completions).toHaveLength(2);
  });

  it('does not allow recording the outcome before the appointment date and time', () => {
    const repository = new InMemoryAppointmentRepository([anAppointment()]);
    const useCase = new SetAppointmentOutcomeUseCase(repository, () => new Date('2026-11-18T15:00:00.000Z'));

    expect(() => useCase.execute({ id: 'appointment-1', completed: true, startsAt: new Date('2026-11-20T15:00:00.000Z') }))
      .toThrow('Solo puedes registrar el resultado');
    expect(() => useCase.execute({ id: 'appointment-1', completed: false, startsAt: new Date('2026-11-18T15:01:00.000Z') }))
      .toThrow(InvalidAppointmentError);
    expect(() => useCase.execute({ id: 'appointment-1', completed: true, startsAt: new Date('nope') }))
      .toThrow(InvalidAppointmentError);
    expect(repository.completions).toHaveLength(0);
  });
});

describe('booking catalog use cases', () => {
  const business: BookingBusiness = {
    id: 'business-1',
    name: 'Salón Brisa',
    description: null,
    address: 'Bogotá',
    services: [],
    stylists: [],
  };
  const stylist: BookingStylist = { id: 'stylist-1', name: 'Carla', specialty: 'Colorista' };
  const reviews: BookingReview[] = [
    { id: 'review-1', author: 'Ana', rating: 5, comment: 'Muy bien', createdAt: '2026-05-01' },
    { id: 'review-2', author: 'Luis', rating: 3, comment: 'Bien', createdAt: '2026-05-02' },
  ];

  it('returns the booking business catalog', async () => {
    const repository = new InMemoryBookingCatalogRepository([business]);
    await expect(new GetBookingBusinessesUseCase(repository).execute()).resolves.toEqual([business]);
  });

  it('returns business stylists for the requested business', async () => {
    const repository = new InMemoryBookingCatalogRepository([], [stylist]);
    await expect(new GetBookingBusinessStylistsUseCase(repository).execute('business-1')).resolves.toEqual([stylist]);
    expect(repository.stylistSearches).toEqual(['business-1']);
  });

  it('summarizes reviews and represents an empty rating as null', async () => {
    const repository = new InMemoryBookingCatalogRepository([], [], reviews);
    await expect(new GetBookingBusinessReviewsUseCase(repository).execute('business-1')).resolves.toMatchObject({
      businessId: 'business-1',
      average: 4,
      count: 2,
      reviews,
    });
    expect(repository.reviewSearches).toEqual(['business-1']);

    const emptyRepository = new InMemoryBookingCatalogRepository();
    await expect(new GetBookingBusinessReviewsUseCase(emptyRepository).execute('business-2')).resolves.toMatchObject({
      businessId: 'business-2',
      average: null,
      count: 0,
      reviews: [],
    });
  });
});
