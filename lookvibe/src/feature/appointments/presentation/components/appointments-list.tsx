'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import type { BookingBusinessSchedule } from '../../domain/entities/booking-business';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { AppointmentsProvider, useAppointments } from '../hooks/use-appointments';
import { dispatchNewBookingStarted } from '../../../../shared/presentation/booking-events';
import { ReviewAppointmentButton } from '../../../reviews/presentation/components/review-appointment-button';

type AppointmentTab = 'upcoming' | 'history';

function AppointmentsListContent() {
  const session = useCurrentSession();
  const {
    appointments,
    availabilitySlots,
    bookingBusinessSchedule,
    loading,
    error,
    loadAppointments,
    loadAvailability,
    loadBookingBusinessSchedule,
    rescheduleAppointment,
    cancelAppointment,
    setAppointmentOutcome,
    clearFeedback,
  } = useAppointments();
  const [tab, setTab] = useState<AppointmentTab>('upcoming');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [rejectedRescheduleKey, setRejectedRescheduleKey] = useState('');
  const roles = session?.roles ?? [];
  const canBook = roles.some((role) => role === 'cliente' || role === 'admin');
  const showClientName = roles.some((role) => role === 'negocio' || role === 'estilista' || role === 'admin');
  const canCancel = roles.some((role) => role === 'cliente' || role === 'negocio' || role === 'estilista' || role === 'admin');
  const canComplete = roles.some((role) => role === 'negocio' || role === 'estilista' || role === 'admin');

  useEffect(() => {
    if (session) void loadAppointments();
  }, [session, loadAppointments]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = window.setInterval(updateTime, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  const upcoming = useMemo(() => appointments.filter((item) => item.status.value === 'pendiente'), [appointments]);
  const history = useMemo(() => appointments.filter((item) => item.status.value !== 'pendiente'), [appointments]);
  const shownAppointments = tab === 'upcoming' ? upcoming : history;
  const currentRescheduleKey = `${editingId ?? ''}:${rescheduleDate}`;
  const availableSlots = rejectedRescheduleKey === currentRescheduleKey
    ? []
    : availabilitySlots.filter((slot) => slot.available
      && slot.startsAt.toDate().getTime() > currentTime
      && withinBusinessHours(slot));
  const editingAppointment = appointments.find((item) => item.id === editingId);
  const editingBusinessId = editingAppointment?.target?.businessId ?? editingAppointment?.businessSummary?.id ?? null;
  const rescheduleSchedule = bookingBusinessSchedule?.businessId === editingBusinessId
    ? bookingBusinessSchedule.schedule
    : null;
  const emptyTitle = showClientName
    ? tab === 'upcoming' ? 'No hay citas próximas' : 'No hay citas en el historial'
    : tab === 'upcoming' ? 'No tienes citas próximas' : 'Tu historial está vacío';
  const emptyDescription = showClientName
    ? 'Las citas asignadas a tu negocio o perfil aparecerán aquí.'
    : tab === 'upcoming' ? 'Cuando reserves un servicio, aparecerá aquí.' : 'Las citas completadas o canceladas aparecerán aquí.';

  async function searchNewTime(appointment: Appointment) {
    if (!rescheduleDate || !appointment.target) return;
    if (rescheduleDate < localDateString()) {
      setActionMessage('Selecciona hoy o una fecha futura.');
      return;
    }
    setActionMessage(null);
    clearFeedback();
    setRescheduleSlot('');
    setAvailabilityDate('');
    await loadAvailability({
      target: appointment.target.stylistId
        ? { type: 'stylist', id: appointment.target.stylistId }
        : { type: 'business', id: appointment.target.businessId ?? '' },
      date: rescheduleDate,
      durationMinutes: appointment.duration.minutes,
      stepMinutes: 30,
    });
    setAvailabilityDate(rescheduleDate);
  }

  async function saveNewTime(appointment: Appointment) {
    if (!rescheduleSlot) return;
    const isCurrentSlotAvailable = availableSlots.some((slot) => slot.startsAt.isoValue === rescheduleSlot);
    if (new Date(rescheduleSlot).getTime() <= currentTime || !isCurrentSlotAvailable) {
      setRescheduleSlot('');
      setActionMessage('Ese horario ya no está disponible. Consulta nuevamente para ver los turnos vigentes.');
      return;
    }
    const result = await rescheduleAppointment({ id: appointment.id, startsAt: new Date(rescheduleSlot) });
    if (result.appointment) {
      setActionMessage('La cita se reprogramó correctamente.');
      setEditingId(null);
      setRescheduleSlot('');
      await loadAppointments();
    } else if (result.error?.toLocaleLowerCase().includes('no coincide con el horario vigente')) {
      setRejectedRescheduleKey(currentRescheduleKey);
      setRescheduleSlot('');
      setAvailabilityDate(rescheduleDate);
      clearFeedback();
      setActionMessage('El horario vigente del negocio no coincide con los turnos recibidos. Elige otra fecha.');
    } else if (result.conflict) {
      setRescheduleSlot('');
      const refreshedSlots = await loadAvailability({
        target: appointment.target?.stylistId
          ? { type: 'stylist', id: appointment.target.stylistId }
          : { type: 'business', id: appointment.target?.businessId ?? '' },
        date: rescheduleDate,
        durationMinutes: appointment.duration.minutes,
        stepMinutes: 30,
      });
      setAvailabilityDate(rescheduleDate);
      if (!refreshedSlots.some((slot) => slot.available && slot.startsAt.toDate().getTime() > currentTime)) {
        setActionMessage('Ese horario se ocupó y ya no quedan turnos para esa fecha. Elige otro día.');
      } else {
        setActionMessage('Ese horario se ocupó mientras guardabas. Elige otro turno disponible.');
      }
    }
  }

  async function confirmCancellation(appointment: Appointment) {
    const cancelled = await cancelAppointment({ id: appointment.id, reason: 'Cancelada desde LookVibe' });
    if (cancelled) {
      setConfirmCancelId(null);
      setActionMessage('La cita se canceló.');
      await loadAppointments();
    }
  }

  async function updateOutcome(appointment: Appointment, completed: boolean) {
    const updated = await setAppointmentOutcome({ id: appointment.id, completed });
    if (updated) {
      setActionMessage(completed ? 'La cita quedó marcada como completada.' : 'La cita quedó marcada como no realizada.');
      await loadAppointments();
    }
  }

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
        <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
          <h1 className="font-display text-2xl font-bold">Inicia sesión para ver tus citas</h1>
          <Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Iniciar sesión</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-7 text-white sm:px-6 sm:pt-10">
      <header className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">{showClientName ? 'Panel LookVibe' : 'Tu espacio LookVibe'}</p><h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{showClientName ? 'Gestión de citas' : 'Mis citas & turnos'}</h1></div>
        {canBook && <Link href="/appointments/new" onClick={dispatchNewBookingStarted} className="rounded-xl bg-[#f59e0b] px-4 py-2.5 text-sm font-display font-bold text-[#0f172a] transition hover:bg-amber-300">＋ Reservar</Link>}
      </header>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-[#172033] p-1.5">
        <button type="button" onClick={() => setTab('upcoming')} className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === 'upcoming' ? 'bg-[#0f172a] text-[#f9c784]' : 'text-slate-400 hover:text-white'}`}>◷ Próximas ({upcoming.length})</button>
        <button type="button" onClick={() => setTab('history')} className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === 'history' ? 'bg-[#0f172a] text-[#f9c784]' : 'text-slate-400 hover:text-white'}`}>◌ Historial ({history.length})</button>
      </div>

      {loading.list && <p className="mt-6 text-center text-sm text-slate-400">Cargando tus citas…</p>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-300/25 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>}
      {actionMessage && <p role="status" className="mt-5 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-4 text-sm text-emerald-200">{actionMessage}</p>}

      {!loading.list && shownAppointments.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f59e0b]/10 text-2xl text-[#f9c784]">◷</span>
          <h2 className="mt-4 font-display text-lg font-bold">{emptyTitle}</h2>
          <p className="mt-2 text-sm text-slate-400">{emptyDescription}</p>
          {tab === 'upcoming' && canBook && <Link href="/appointments/new" onClick={dispatchNewBookingStarted} className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Buscar un servicio</Link>}
        </section>
      ) : (
        <div className="mt-5 space-y-4">
          {shownAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              canCancel={canCancel}
              canComplete={canComplete}
              showClientName={showClientName}
              canReschedule={roles.includes('admin')
                || roles.includes('cliente')
                || roles.includes('negocio')
                || (roles.includes('estilista') && appointment.stylistSummary?.affiliationStatus === 'INDEPENDIENTE')}
              editing={editingId === appointment.id}
              confirmingCancellation={confirmCancelId === appointment.id}
              date={rescheduleDate}
              availabilityDate={availabilityDate}
              selectedSlot={rescheduleSlot}
              slots={availableSlots}
              businessSchedule={rescheduleSchedule}
              scheduleLoading={loading.schedule}
              showBusinessSchedule={Boolean(editingBusinessId)}
              noSlots={rejectedRescheduleKey === currentRescheduleKey}
              loading={loading.availability || loading.action}
              onEdit={() => {
                setEditingId(appointment.id);
                setConfirmCancelId(null);
                setRescheduleDate('');
                setRescheduleSlot('');
                setAvailabilityDate('');
                setRejectedRescheduleKey('');
                clearFeedback();
                const businessId = appointment.target?.businessId ?? appointment.businessSummary?.id;
                if (businessId) void loadBookingBusinessSchedule(businessId);
              }}
              onCancel={() => { setConfirmCancelId(appointment.id); setEditingId(null); }}
              onDateChange={(value) => { setRescheduleDate(value); setRescheduleSlot(''); setAvailabilityDate(''); setRejectedRescheduleKey(''); setActionMessage(null); clearFeedback(); }}
              onSlotSelect={setRescheduleSlot}
              onSearch={() => searchNewTime(appointment)}
              onSave={() => saveNewTime(appointment)}
              onConfirmCancel={() => confirmCancellation(appointment)}
              onSetOutcome={(completed) => updateOutcome(appointment, completed)}
              onDismiss={() => { setEditingId(null); setConfirmCancelId(null); }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function AppointmentCard({
  appointment,
  canCancel,
  canComplete,
  showClientName,
  canReschedule,
  editing,
  confirmingCancellation,
  date,
  availabilityDate,
  selectedSlot,
  slots,
  businessSchedule,
  scheduleLoading,
  showBusinessSchedule,
  noSlots,
  loading,
  onEdit,
  onCancel,
  onDateChange,
  onSlotSelect,
  onSearch,
  onSave,
  onConfirmCancel,
  onSetOutcome,
  onDismiss,
}: {
  appointment: Appointment;
  canCancel: boolean;
  canComplete: boolean;
  showClientName: boolean;
  canReschedule: boolean;
  editing: boolean;
  confirmingCancellation: boolean;
  date: string;
  availabilityDate: string;
  selectedSlot: string;
  slots: AppointmentSlot[];
  businessSchedule: BookingBusinessSchedule | null;
  scheduleLoading: boolean;
  showBusinessSchedule: boolean;
  noSlots: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onSearch: () => void;
  onSave: () => void;
  onConfirmCancel: () => void;
  onSetOutcome: (completed: boolean) => void;
  onDismiss: () => void;
}) {
  const address = appointment.businessSummary?.address;
  const mapUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
  const statusLabel: Record<string, string> = { pendiente: 'Cita confirmada', completada: 'Completada', cancelada: 'Cancelada', no_realizada: 'No realizada' };
  const statusTone = appointment.status.value === 'pendiente' ? 'text-emerald-300' : appointment.status.value === 'cancelada' ? 'text-rose-300' : 'text-slate-300';

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#172033] shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
        <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${statusTone}`}><span className="size-2 rounded-full bg-current" />{statusLabel[appointment.status.value]}</p>
        <p className="text-xs text-slate-400">{appointment.status.value === 'pendiente' ? 'Próxima cita' : 'En tu historial'}</p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-xl text-[#f9c784]">✦</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-bold sm:text-lg">{appointment.serviceSummary?.name ?? 'Servicio de belleza'}</h2>
            <p className="mt-1 text-sm text-slate-300">{appointment.businessSummary?.name ?? 'Negocio'}{appointment.stylistSummary ? ` · ${appointment.stylistSummary.specialty}` : ''}</p>
            {showClientName && <p className="mt-1 text-sm font-medium text-[#f9c784]">Cliente: {appointment.clientName || 'Nombre no disponible'}</p>}
            {address && <p className="mt-1 text-xs text-slate-400">{address}</p>}
          </div>
          <span className="hidden rounded-full bg-[#10b981]/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 sm:inline">{appointment.duration.minutes} min</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#0f172a] p-3 sm:p-4">
          <div><p className="text-[11px] text-slate-400">Fecha y hora</p><p className="mt-1 font-display text-sm font-semibold">{formatDateTime(appointment.startsAt.toDate())}</p></div>
          <div className="text-right"><p className="text-[11px] text-slate-400">Total a pagar</p><p className="mt-1 font-display font-bold text-[#f9c784]">{appointment.price.total === null ? 'Por confirmar' : formatCop(appointment.price.total)}</p></div>
        </div>
        {appointment.welcomeBenefitApplied && appointment.price.welcomeDiscount > 0 && (
          <p className="mt-3 rounded-xl bg-[#10b981]/10 px-3 py-2 text-xs font-semibold text-emerald-200">Beneficio de primera cita · −{formatCop(appointment.price.welcomeDiscount)}</p>
        )}

        {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl bg-[#10b981] px-4 py-3 text-center text-sm font-semibold text-[#0f172a] transition hover:bg-emerald-300">↗ Indicaciones de ruta · Abrir mapa</a>}

        {appointment.status.value === 'pendiente' && (canCancel || canReschedule || canComplete) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {canReschedule && <button type="button" onClick={onEdit} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/5">↻ Reagendar</button>}
            {canCancel && <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/5">× Cancelar</button>}
            {canComplete && <button type="button" onClick={() => onSetOutcome(true)} disabled={loading} className="flex-1 rounded-xl bg-[#10b981] px-3 py-2.5 text-sm font-bold text-[#0f172a] disabled:opacity-50">✓ Completar</button>}
            {canComplete && <button type="button" onClick={() => onSetOutcome(false)} disabled={loading} className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/5 disabled:opacity-50">Marcar no realizada</button>}
          </div>
        )}

        {appointment.status.value === 'completada' && <ReviewAppointmentButton appointmentId={appointment.id} businessName={appointment.businessSummary?.name ?? null} />}

        {editing && (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[#0f172a] p-4">
            <h3 className="font-display font-semibold">Elige una nueva fecha y hora</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input type="date" min={localDateString()} value={date} onChange={(event) => onDateChange(event.target.value)} className={`${fieldClass} cursor-pointer [color-scheme:dark]`} />
              <button type="button" disabled={!date || loading || (availabilityDate === date && slots.length === 0)} onClick={onSearch} className="shrink-0 rounded-xl bg-[#10b981] px-4 py-3 text-sm font-bold text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Buscando…' : availabilityDate === date && slots.length === 0 ? 'Sin turnos para esta fecha' : 'Ver turnos disponibles'}</button>
            </div>
            {showBusinessSchedule && (
              <section className="rounded-xl border border-white/10 bg-[#172033] p-3">
                <p className="text-xs font-semibold text-slate-200">Horario de atención del negocio</p>
                {scheduleLoading ? <p className="mt-1 text-xs text-slate-400">Cargando horario…</p>
                  : businessSchedule?.intervals.length ? <>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">{groupBusinessSchedule(businessSchedule.intervals).map((group) => <li key={`${group.days.join('-')}-${group.hours}`}><span className="font-semibold text-white">{group.days.length > 1 ? `${group.days[0]}–${group.days[group.days.length - 1]}` : group.days[0]}:</span> {group.hours}</li>)}</ul>
                    <p className="mt-2 text-[11px] text-slate-500">Hora local · {businessSchedule.timeZone}</p>
                  </> : businessSchedule ? <p className="mt-1 text-xs text-amber-200">El negocio aún no configura horarios semanales.</p>
                    : <p className="mt-1 text-xs text-slate-400">No pudimos cargar el horario de atención.</p>}
              </section>
            )}
            {availabilityDate === date && slots.length > 0 && <div className="grid grid-cols-3 gap-2">{slots.map((slot) => {
              const value = slot.startsAt.toDate().toISOString();
              const selected = value === selectedSlot;
              return <button key={value} type="button" onClick={() => onSlotSelect(value)} className={`rounded-lg border px-2 py-2 text-sm ${selected ? 'border-[#f59e0b] bg-[#f59e0b] font-bold text-[#0f172a]' : 'border-white/10 text-white'}`}>{formatTime(slot)}</button>;
            })}</div>}
            {availabilityDate === date && slots.length === 0 && !loading && <p className="rounded-xl border border-white/10 bg-[#172033] p-3 text-xs text-slate-300">{noSlots
              ? 'El turno no coincide con el horario vigente del negocio. Elige otra fecha.'
              : date === localDateString()
                ? 'Ya no quedan turnos disponibles para hoy. Elige otra fecha.'
                : 'El negocio no tiene turnos disponibles para esta fecha; puede estar cerrado o tener todos sus turnos ocupados.'}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={onDismiss} className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">Volver</button>
              <button type="button" disabled={!selectedSlot || loading} onClick={onSave} className="flex-1 rounded-xl bg-[#f59e0b] px-3 py-2 text-sm font-bold text-[#0f172a] disabled:opacity-40">Guardar cambio</button>
            </div>
          </div>
        )}

        {confirmingCancellation && (
          <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-950/20 p-4">
            <p className="text-sm text-rose-100">¿Quieres cancelar esta cita?</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={onDismiss} className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300">Mantener cita</button>
              <button type="button" onClick={onConfirmCancel} className="flex-1 rounded-xl bg-rose-500 px-3 py-2 text-sm font-bold text-white">Sí, cancelar</button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function AppointmentsList() {
  return <AppointmentsProvider><AppointmentsListContent /></AppointmentsProvider>;
}

const fieldClass = 'min-w-0 flex-1 rounded-xl border border-white/15 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-[#f59e0b]';

function withinBusinessHours(slot: AppointmentSlot): boolean {
  return minutesInTimeZone(slot.startsAt.toDate(), slot.timeZone) >= 420
    && minutesInTimeZone(slot.endsAt.toDate(), slot.timeZone) <= 1260;
}

function localDateString(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function groupBusinessSchedule(intervals: BookingBusinessSchedule['intervals']) {
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const groups: Array<{ days: string[]; hours: string }> = [];
  for (const day of dayOrder) {
    const hours = intervals
      .filter((interval) => interval.dayOfWeek === day)
      .sort((left, right) => left.startTime.localeCompare(right.startTime))
      .map((interval) => `${formatScheduleTime(interval.startTime)}–${formatScheduleTime(interval.endTime)}`)
      .join(', ') || 'Cerrado';
    const previous = groups[groups.length - 1];
    if (previous?.hours === hours) previous.days.push(dayNames[day]);
    else groups.push({ days: [dayNames[day]], hours });
  }
  return groups;
}

function formatScheduleTime(value: string): string {
  return new Date(`1970-01-01T${value}:00Z`).toLocaleTimeString('es-CO', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function minutesInTimeZone(date: Date, timeZone: string): number {
  const values = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  return Number(values.find((item) => item.type === 'hour')?.value ?? 0) * 60 + Number(values.find((item) => item.type === 'minute')?.value ?? 0);
}

function formatTime(slot: AppointmentSlot): string {
  return slot.startsAt.toDate().toLocaleTimeString('en-US', { timeZone: slot.timeZone, hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
}

function formatCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}
