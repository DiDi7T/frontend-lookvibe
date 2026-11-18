'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import type { BookingBusiness, BookingBusinessSchedule, BookingReviewsSummary, BookingStylist } from '../../domain/entities/booking-business';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';
import { HttpError } from '../../../../shared/infrastructure/http-client';
import { appointmentsContainer } from '../../di/appointments.container';
import { dispatchAppointmentCancelled } from '../../../../shared/presentation/booking-events';
import type { CancelAppointmentInput } from '../../application/use-cases/cancel-appointment.use-case';
import type { CreateAppointmentInput } from '../../application/use-cases/create-appointment.use-case';
import type { GetAvailabilityInput } from '../../application/use-cases/get-availability.use-case';
import type { RescheduleAppointmentInput } from '../../application/use-cases/reschedule-appointment.use-case';
import type { SetAppointmentOutcomeInput } from '../../application/use-cases/set-appointment-outcome.use-case';

interface AppointmentLoadingState {
  list: boolean;
  detail: boolean;
  availability: boolean;
  action: boolean;
  reviews: boolean;
  schedule: boolean;
}

interface AppointmentsContextValue {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  availabilitySlots: AppointmentSlot[];
  bookingBusinesses: BookingBusiness[];
  bookingBusinessReviews: BookingReviewsSummary | null;
  bookingBusinessStylists: { businessId: string; stylists: BookingStylist[] } | null;
  bookingBusinessSchedule: { businessId: string; schedule: BookingBusinessSchedule } | null;
  loading: AppointmentLoadingState;
  error: string | null;
  success: string | null;
  loadAppointments: () => Promise<void>;
  loadAppointment: (id: string) => Promise<Appointment | null>;
  loadAvailability: (input: GetAvailabilityInput) => Promise<AppointmentSlot[]>;
  loadBookingBusinesses: () => Promise<BookingBusiness[]>;
  loadBookingBusinessReviews: (businessId: string) => Promise<BookingReviewsSummary | null>;
  loadBookingBusinessStylists: (businessId: string) => Promise<BookingStylist[]>;
  loadBookingBusinessSchedule: (businessId: string) => Promise<BookingBusinessSchedule | null>;
  bookAppointment: (input: CreateAppointmentInput) => Promise<{
    appointment: Appointment | null;
    error: string | null;
    conflict: boolean;
  }>;
  rescheduleAppointment: (input: RescheduleAppointmentInput) => Promise<{
    appointment: Appointment | null;
    error: string | null;
    conflict: boolean;
  }>;
  cancelAppointment: (input: CancelAppointmentInput) => Promise<boolean>;
  setAppointmentOutcome: (input: SetAppointmentOutcomeInput) => Promise<Appointment | null>;
  clearFeedback: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AppointmentSlot[]>([]);
  const [bookingBusinesses, setBookingBusinesses] = useState<BookingBusiness[]>([]);
  const [bookingBusinessReviews, setBookingBusinessReviews] = useState<BookingReviewsSummary | null>(null);
  const [bookingBusinessStylists, setBookingBusinessStylists] = useState<{ businessId: string; stylists: BookingStylist[] } | null>(null);
  const [bookingBusinessSchedule, setBookingBusinessSchedule] = useState<{ businessId: string; schedule: BookingBusinessSchedule } | null>(null);
  const [loading, setLoading] = useState<AppointmentLoadingState>({
    list: false,
    detail: false,
    availability: false,
    action: false,
    reviews: false,
    schedule: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const begin = useCallback((key: keyof AppointmentLoadingState) => {
    setError(null);
    setSuccess(null);
    setLoading((current) => ({ ...current, [key]: true }));
  }, []);

  const finish = useCallback((key: keyof AppointmentLoadingState) => {
    setLoading((current) => ({ ...current, [key]: false }));
  }, []);

  const syncAppointment = useCallback((appointment: Appointment) => {
    setAppointments((current) => {
      const exists = current.some((item) => item.id === appointment.id);
      const next = exists
        ? current.map((item) => (item.id === appointment.id ? appointment : item))
        : [...current, appointment];
      return next.sort((left, right) =>
        left.startsAt.isoValue.localeCompare(right.startsAt.isoValue),
      );
    });
    setSelectedAppointment((current) =>
      current?.id === appointment.id ? appointment : current,
    );
  }, []);

  const loadAppointments = useCallback(async () => {
    begin('list');
    try {
      setAppointments(await appointmentsContainer.getAppointments.execute());
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
    } finally {
      finish('list');
    }
  }, [begin, finish]);

  const loadBookingBusinessReviews = useCallback(async (businessId: string) => {
    setBookingBusinessReviews(null);
    begin('reviews');
    try {
      const reviews = await appointmentsContainer.getBookingBusinessReviews.execute(businessId);
      setBookingBusinessReviews(reviews);
      return reviews;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('reviews');
    }
  }, [begin, finish]);

  const loadBookingBusinessStylists = useCallback(async (businessId: string) => {
    setBookingBusinessStylists(null);
    try {
      const stylists = await appointmentsContainer.getBookingBusinessStylists.execute(businessId);
      setBookingBusinessStylists({ businessId, stylists });
      return stylists;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return [];
    }
  }, []);

  const loadBookingBusinessSchedule = useCallback(async (businessId: string) => {
    setBookingBusinessSchedule(null);
    begin('schedule');
    try {
      const schedule = await appointmentsContainer.getBookingBusinessSchedule.execute(businessId);
      setBookingBusinessSchedule({ businessId, schedule });
      return schedule;
    } catch {
      return null;
    } finally {
      finish('schedule');
    }
  }, [begin, finish]);

  const loadAppointment = useCallback(async (id: string) => {
    begin('detail');
    try {
      const appointment = await appointmentsContainer.getAppointment.execute(id);
      setSelectedAppointment(appointment);
      return appointment;
    } catch (reason: unknown) {
      setSelectedAppointment(null);
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('detail');
    }
  }, [begin, finish]);

  const loadAvailability = useCallback(async (input: GetAvailabilityInput) => {
    begin('availability');
    try {
      const slots = await appointmentsContainer.getAvailability.execute(input);
      setAvailabilitySlots(slots);
      return slots;
    } catch (reason: unknown) {
      setAvailabilitySlots([]);
      setError(toUserMessage(reason));
      return [];
    } finally {
      finish('availability');
    }
  }, [begin, finish]);

  const loadBookingBusinesses = useCallback(async () => {
    begin('list');
    try {
      const businesses = await appointmentsContainer.getBookingBusinesses.execute();
      setBookingBusinesses(businesses);
      return businesses;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return [];
    } finally {
      finish('list');
    }
  }, [begin, finish]);

  const bookAppointment = useCallback(async (input: CreateAppointmentInput) => {
    begin('action');
    try {
      const appointment = await appointmentsContainer.createAppointment.execute(input);
      syncAppointment(appointment);
      setSelectedAppointment(appointment);
      setSuccess('La cita se reservó correctamente.');
      return { appointment, error: null, conflict: false };
    } catch (reason: unknown) {
      const message = toUserMessage(reason);
      setError(message);
      return {
        appointment: null,
        error: message,
        conflict: reason instanceof HttpError && reason.status === 409,
      };
    } finally {
      finish('action');
    }
  }, [begin, finish, syncAppointment]);

  const rescheduleAppointment = useCallback(async (input: RescheduleAppointmentInput) => {
    begin('action');
    try {
      const appointment = await appointmentsContainer.rescheduleAppointment.execute(input);
      syncAppointment(appointment);
      setSuccess('La cita se actualizó correctamente.');
      return { appointment, error: null, conflict: false };
    } catch (reason: unknown) {
      const message = toUserMessage(reason);
      setError(message);
      return {
        appointment: null,
        error: message,
        conflict: reason instanceof HttpError && reason.status === 409,
      };
    } finally {
      finish('action');
    }
  }, [begin, finish, syncAppointment]);

  const cancelAppointment = useCallback(async (input: CancelAppointmentInput) => {
    begin('action');
    try {
      await appointmentsContainer.cancelAppointment.execute(input);
      dispatchAppointmentCancelled(input.id);
      setSuccess('La cita se canceló correctamente.');
      try {
        const appointment = await appointmentsContainer.getAppointment.execute(input.id);
        syncAppointment(appointment);
      } catch {
        setError('La cita se canceló, pero no se pudo actualizar su información. Recarga la vista.');
      }
      return true;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return false;
    } finally {
      finish('action');
    }
  }, [begin, finish, syncAppointment]);

  const setAppointmentOutcome = useCallback(async (input: SetAppointmentOutcomeInput) => {
    begin('action');
    try {
      const appointment = await appointmentsContainer.setAppointmentOutcome.execute(input);
      syncAppointment(appointment);
      setSuccess(input.completed
        ? 'La cita quedó marcada como completada.'
        : 'La cita quedó marcada como no realizada.');
      return appointment;
    } catch (reason: unknown) {
      setError(toUserMessage(reason));
      return null;
    } finally {
      finish('action');
    }
  }, [begin, finish, syncAppointment]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = useMemo<AppointmentsContextValue>(() => ({
    appointments,
    selectedAppointment,
    availabilitySlots,
    bookingBusinesses,
    bookingBusinessReviews,
    bookingBusinessStylists,
    bookingBusinessSchedule,
    loading,
    error,
    success,
    loadAppointments,
    loadAppointment,
    loadAvailability,
    loadBookingBusinesses,
    loadBookingBusinessReviews,
    loadBookingBusinessStylists,
    loadBookingBusinessSchedule,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    setAppointmentOutcome,
    clearFeedback,
  }), [
    appointments,
    selectedAppointment,
    availabilitySlots,
    bookingBusinesses,
    bookingBusinessReviews,
    bookingBusinessStylists,
    bookingBusinessSchedule,
    loading,
    error,
    success,
    loadAppointments,
    loadAppointment,
    loadAvailability,
    loadBookingBusinesses,
    loadBookingBusinessReviews,
    loadBookingBusinessStylists,
    loadBookingBusinessSchedule,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    setAppointmentOutcome,
    clearFeedback,
  ]);

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments(): AppointmentsContextValue {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments debe usarse dentro de AppointmentsProvider.');
  }
  return context;
}

function toUserMessage(reason: unknown): string {
  if (reason instanceof InvalidAppointmentError) return reason.message;
  if (reason instanceof HttpError) {
    if (reason.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (reason.status === 403) return 'No tienes permiso para realizar esta acción.';
    if (reason.status === 404) return 'No se encontró el recurso solicitado en el servidor.';
    if (reason.status === 409) {
      const message = getResponseMessage(reason.body)?.toLocaleLowerCase();
      if (message?.includes('fuera del horario')) {
        return 'Ese horario no coincide con el horario vigente del negocio. Actualicé la disponibilidad; elige otro.';
      }
      if (message?.includes('ya no está disponible')) {
        return 'Otra cita ocupó ese horario. Actualicé la disponibilidad; elige otro.';
      }
      return 'El horario dejó de estar disponible. Actualicé la disponibilidad; elige otro.';
    }
    if (reason.status >= 500) return 'El servicio no está disponible en este momento.';

    const message = getResponseMessage(reason.body);
    if (message) return message;
  }
  if (reason instanceof Error && reason.message === 'No autorizado') {
    return 'Tu sesión expiró. Inicia sesión nuevamente.';
  }
  if (reason instanceof Error && reason.message === 'Servicio no disponible') {
    return 'No fue posible conectar con el servicio. Inténtalo nuevamente.';
  }
  return 'No se pudo completar la operación. Inténtalo nuevamente.';
}

function getResponseMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) return body;
  if (typeof body !== 'object' || body === null || !('message' in body)) return null;
  const message = body.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ');
  }
  return null;
}
