'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { AppointmentsProvider, useAppointments } from '../hooks/use-appointments';
import { APPOINTMENT_CANCELLED_EVENT, NEW_BOOKING_EVENT } from '../../../../shared/presentation/booking-events';

type BookingStep = 1 | 2 | 3;

interface BookingSelection {
  initialBusinessId?: string;
  initialServiceId?: string;
  initialStylistId?: string;
}

function BookingFormContent({ initialBusinessId, initialServiceId, initialStylistId }: BookingSelection) {
  const session = useCurrentSession();
  const {
    bookingBusinesses,
    appointments,
    bookingBusinessReviews,
    bookingBusinessStylists,
    bookingBusinessSchedule,
    availabilitySlots,
    loading,
    error,
    loadBookingBusinesses,
    loadAppointments,
    loadBookingBusinessReviews,
    loadBookingBusinessStylists,
    loadBookingBusinessSchedule,
    loadAvailability,
    bookAppointment,
    clearFeedback,
  } = useAppointments();
  const [step, setStep] = useState<BookingStep>(1);
  const [businessId, setBusinessId] = useState(initialBusinessId ?? '');
  const [serviceId, setServiceId] = useState(initialServiceId ?? '');
  const [stylistId, setStylistId] = useState(initialStylistId ?? '');
  const [businessSearch, setBusinessSearch] = useState('');
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [queriedAvailabilityKey, setQueriedAvailabilityKey] = useState('');
  const [invalidAvailabilityKey, setInvalidAvailabilityKey] = useState('');
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [reservationNotice, setReservationNotice] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const selectedBusiness = bookingBusinesses.find((business) => business.id === businessId);
  const currentBusinessReviews = bookingBusinessReviews?.businessId === businessId
    ? bookingBusinessReviews
    : null;
  const currentBusinessStylists = bookingBusinessStylists?.businessId === businessId
    ? bookingBusinessStylists.stylists
    : selectedBusiness?.stylists ?? [];
  const currentBusinessSchedule = bookingBusinessSchedule?.businessId === businessId
    ? bookingBusinessSchedule.schedule
    : null;
  const selectedService = selectedBusiness?.services.find((service) => service.id === serviceId);
  const selectedStylist = currentBusinessStylists.find((stylist) => stylist.id === stylistId);
  const currentAvailabilityKey = getAvailabilityKey(businessId, serviceId, stylistId, date);
  const currentAvailabilitySlots = queriedAvailabilityKey === currentAvailabilityKey ? availabilitySlots : [];
  const canBook = session?.roles.some((role) => role === 'cliente' || role === 'admin') ?? false;
  const visibleAvailabilitySlots = currentAvailabilitySlots.filter((slot) => {
    const startMinutes = minutesInTimeZone(slot.startsAt.toDate(), slot.timeZone);
    const endMinutes = minutesInTimeZone(slot.endsAt.toDate(), slot.timeZone);
    return invalidAvailabilityKey !== currentAvailabilityKey
      && slot.available
      && slot.startsAt.toDate().getTime() > currentTime
      && !blockedSlots.includes(slot.startsAt.isoValue)
      && startMinutes >= 7 * 60
      && endMinutes <= 21 * 60;
  });
  const slotGroups = useMemo(() => groupSlots(visibleAvailabilitySlots), [visibleAvailabilitySlots]);
  const recentBusinesses = useMemo(() => {
    const visitedIds = new Set(
      [...appointments]
        .filter((appointment) => appointment.status.value === 'completada' && appointment.businessSummary)
        .sort((left, right) => right.startsAt.isoValue.localeCompare(left.startsAt.isoValue))
        .map((appointment) => appointment.businessSummary!.id),
    );
    return [...visitedIds]
      .map((id) => bookingBusinesses.find((business) => business.id === id))
      .filter((business) => business !== undefined)
      .slice(0, 4);
  }, [appointments, bookingBusinesses]);
  const filteredBusinesses = useMemo(() => {
    const query = businessSearch.trim().toLocaleLowerCase('es');
    if (!query) return [];
    return bookingBusinesses.filter((business) =>
      `${business.name} ${business.address ?? ''}`.toLocaleLowerCase('es').includes(query),
    ).slice(0, 8);
  }, [bookingBusinesses, businessSearch]);

  useEffect(() => {
    void loadBookingBusinesses();
  }, [loadBookingBusinesses]);

  useEffect(() => {
    if (session) void loadAppointments();
  }, [session, loadAppointments]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = window.setInterval(updateTime, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!businessId) return;
    void loadBookingBusinessReviews(businessId);
    void loadBookingBusinessStylists(businessId);
    void loadBookingBusinessSchedule(businessId);
  }, [businessId, loadBookingBusinessReviews, loadBookingBusinessSchedule, loadBookingBusinessStylists]);

  useEffect(() => {
    function resetBooking() {
      setConfirmedAppointment(null);
      setStep(1);
      setBusinessId('');
      setServiceId('');
      setStylistId('');
      setBusinessSearch('');
      setDate('');
      setSelectedSlot('');
      setBlockedSlots([]);
      setQueriedAvailabilityKey('');
      setInvalidAvailabilityKey('');
      setReservationNotice(null);
      setNote('');
      clearFeedback();
    }

    function handleBookingRestart() {
      resetBooking();
    }

    function handleAppointmentCancelled(event: Event) {
      const appointmentId = (event as CustomEvent<{ appointmentId: string }>).detail?.appointmentId;
      if (confirmedAppointment?.id === appointmentId) resetBooking();
    }

    window.addEventListener(NEW_BOOKING_EVENT, handleBookingRestart);
    window.addEventListener(APPOINTMENT_CANCELLED_EVENT, handleAppointmentCancelled);
    return () => {
      window.removeEventListener(NEW_BOOKING_EVENT, handleBookingRestart);
      window.removeEventListener(APPOINTMENT_CANCELLED_EVENT, handleAppointmentCancelled);
    };
  }, [clearFeedback, confirmedAppointment]);

  async function searchAvailability() {
    if (!selectedBusiness || !selectedService || !date) return;
    if (date < localDateString()) {
      setDateError('Selecciona hoy o una fecha futura.');
      return;
    }
    setDateError(null);
    setSelectedSlot('');
    const query = {
      target: stylistId
        ? { type: 'stylist' as const, id: stylistId }
        : { type: 'business' as const, id: selectedBusiness.id },
      date,
      durationMinutes: selectedService.durationMinutes,
      stepMinutes: 30,
    };
    setQueriedAvailabilityKey('');
    await loadAvailability(query);
    setQueriedAvailabilityKey(currentAvailabilityKey);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    if (!session || !canBook || !selectedBusiness || !selectedService || !selectedSlot) return;
    if (new Date(selectedSlot).getTime() <= currentTime
      || !visibleAvailabilitySlots.some((slot) => slot.startsAt.isoValue === selectedSlot)) {
      setSelectedSlot('');
      return;
    }
    const result = await bookAppointment({
      userId: session.userId,
      businessId: selectedBusiness.id,
      ...(stylistId ? { stylistId } : {}),
      serviceId: selectedService.id,
      startsAt: new Date(selectedSlot),
      ...(note.trim() ? { note: note.trim() } : {}),
    });

    if (result.appointment) {
      setConfirmedAppointment(result.appointment);
      setReservationNotice(null);
      setStep(3);
    } else if (result.error?.toLocaleLowerCase().includes('no coincide con el horario vigente')) {
      setSelectedSlot('');
      setInvalidAvailabilityKey(currentAvailabilityKey);
      setReservationNotice(null);
      clearFeedback();
    } else if (result.conflict) {
      setSelectedSlot('');
      setBlockedSlots((current) => [...new Set([...current, selectedSlot])]);
      setReservationNotice(result.error);
      await loadAvailability({
        target: stylistId
          ? { type: 'stylist', id: stylistId }
          : { type: 'business', id: selectedBusiness.id },
        date,
        durationMinutes: selectedService.durationMinutes,
        stepMinutes: 30,
      });
    }
  }

  if (!canBook) {
    const isSignedIn = session !== null;
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 text-white sm:px-8">
        <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center shadow-xl">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-2xl text-[#f9c784]">✦</span>
          <h1 className="mt-5 font-display text-2xl font-bold">{isSignedIn ? 'Tu rol no puede reservar citas' : 'Agenda una experiencia para ti'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{isSignedIn ? 'La reserva de citas está disponible para clientes y administradores.' : 'Inicia sesión con una cuenta de cliente para elegir un servicio y reservar.'}</p>
          {isSignedIn
            ? <Link href="/appointments" className="mt-6 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Volver a gestión de citas</Link>
            : <Link href="/login" className="mt-6 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Iniciar sesión</Link>}
        </section>
      </main>
    );
  }

  if (step === 3 && confirmedAppointment && selectedBusiness && selectedService) {
    return (
      <ConfirmationScreen
        appointment={confirmedAppointment}
        businessName={selectedBusiness.name}
        businessAddress={selectedBusiness.address}
        serviceName={selectedService.name}
        stylistName={selectedStylist ? `${selectedStylist.name?.trim() || 'Profesional'} · ${selectedStylist.specialty}` : null}
        onBookAgain={() => {
          setConfirmedAppointment(null);
          setSelectedSlot('');
          setDate('');
          setStep(1);
        }}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-7 text-white sm:px-6 sm:pt-10">
      <Link href="/" className="text-sm font-medium text-[#f9c784] hover:underline">← Inicio</Link>
      <div className="mb-6 mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Agendar cita</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{step === 1 ? 'Selecciona tu servicio' : 'Elige día y horario'}</h1>
        </div>
        <div className="rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-2 text-xs font-semibold text-emerald-200">
          Paso {step} de 4
        </div>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] transition-all ${step === 1 ? 'w-1/4' : 'w-2/4'}`} />
      </div>

      <form onSubmit={submitBooking}>
        {step === 1 ? (
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#172033] p-4 shadow-xl shadow-black/10 sm:p-6">
            {selectedBusiness ? (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-4">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-[#f9c784]">Negocio seleccionado</p><p className="mt-1 font-display font-bold">{selectedBusiness.name}</p><p className="mt-1 text-xs text-slate-300">{selectedBusiness.address ?? 'Dirección por confirmar'}</p></div>
                <button type="button" onClick={() => { setBusinessId(''); setServiceId(''); setStylistId(''); setBusinessSearch(''); }} className="shrink-0 text-sm font-semibold text-[#f9c784] hover:underline">Cambiar</button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBusinesses.length > 0 && <div><p className="mb-2 text-sm font-semibold text-slate-200">Negocios que ya visitaste</p><div className="flex flex-wrap gap-2">{recentBusinesses.map((business) => <button key={business.id} type="button" onClick={() => {
                  setBusinessId(business.id);
                  setServiceId('');
                  setStylistId('');
                  setBusinessSearch('');
                  void loadBookingBusinessReviews(business.id);
                  void loadBookingBusinessStylists(business.id);
                }} className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-left hover:border-[#f59e0b]/60"><span className="block font-semibold text-white">{business.name}</span><span className="mt-1 block text-xs text-slate-400">{business.address ?? 'Dirección por confirmar'}</span></button>)}</div></div>}
                <label className="block text-sm font-semibold text-slate-200">
                  Busca un negocio por nombre o dirección
                  <input value={businessSearch} onChange={(event) => setBusinessSearch(event.target.value)} placeholder="Ej. Alma Nails o Granada" className={fieldClass} />
                </label>
                {businessSearch.trim() && <ul className="max-h-56 divide-y divide-white/10 overflow-y-auto rounded-xl border border-white/10 bg-[#0f172a]">{filteredBusinesses.map((business) => <li key={business.id}><button type="button" onClick={() => {
                  const nextBusinessId = business.id;
                setBusinessId(nextBusinessId);
                setServiceId('');
                setStylistId('');
                  setBusinessSearch('');
                setSelectedSlot('');
                setBlockedSlots([]);
                setQueriedAvailabilityKey('');
                  void loadBookingBusinessReviews(nextBusinessId);
                  void loadBookingBusinessStylists(nextBusinessId);
                }} className="w-full px-4 py-3 text-left hover:bg-white/5"><span className="block font-semibold">{business.name}</span><span className="mt-1 block text-xs text-slate-400">{business.address ?? 'Dirección por confirmar'}</span></button></li>)}{filteredBusinesses.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No encontramos negocios con esa búsqueda.</li>}</ul>}
              </div>
            )}

            {selectedBusiness && (
              <section className="rounded-2xl border border-white/5 bg-[#0f172a]/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Opiniones del negocio</p>
                    {loading.reviews ? <p className="mt-1 text-sm text-slate-400">Cargando reseñas…</p>
                      : !currentBusinessReviews ? <p className="mt-1 text-sm text-slate-400">Consultando opiniones…</p>
                        : currentBusinessReviews.average === null ? <p className="mt-1 text-sm text-slate-300">Aún no tiene reseñas.</p>
                          : <p className="mt-1 font-display font-bold text-white">★ {currentBusinessReviews.average.toFixed(1)} <span className="text-xs font-normal text-slate-400">· {currentBusinessReviews.count} reseñas</span></p>}
                  </div>
                  {currentBusinessReviews && currentBusinessReviews.average !== null && <span className="rounded-full bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-[#f9c784]">Calificación</span>}
                </div>
                {currentBusinessReviews?.reviews[0] && (
                  <blockquote className="mt-3 border-l-2 border-[#10b981] pl-3 text-sm text-slate-300">
                    <p>“{currentBusinessReviews.reviews[0].comment}”</p>
                    <footer className="mt-2 text-xs text-slate-500">— {currentBusinessReviews.reviews[0].author} · {currentBusinessReviews.reviews[0].rating}/5</footer>
                  </blockquote>
                )}
              </section>
            )}

            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold">Servicios</h2>
                  <p className="mt-1 text-xs text-slate-400">Selecciona el servicio para tu cita.</p>
                </div>
                <span className="rounded-full bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-[#f9c784]">{selectedService ? '1 servicio' : '0 servicios'}</span>
              </div>
              {!selectedBusiness ? (
                <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-400">Primero selecciona un negocio para ver sus servicios.</p>
              ) : selectedBusiness.services.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-slate-400">Este negocio todavía no publica servicios para reservar.</p>
              ) : (
                <div className="space-y-3">
                  {selectedBusiness.services.map((service) => {
                    const selected = serviceId === service.id;
                    return (
                      <button key={service.id} type="button" aria-pressed={selected} onClick={() => {
                        setServiceId(service.id);
                        setSelectedSlot('');
                        setBlockedSlots([]);
                        setQueriedAvailabilityKey('');
                      }} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-[#f59e0b] bg-[#f59e0b]/10 ring-1 ring-[#f59e0b]/60' : 'border-white/10 bg-[#0f172a]/60 hover:border-white/25'}`}>
                        <span className="flex items-start justify-between gap-4">
                          <span className="flex min-w-0 items-start gap-3">
                            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-xs ${selected ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]' : 'border-white/25 text-transparent'}`}>✓</span>
                            <span>
                              <span className="block font-display font-bold text-white">{service.name}</span>
                              <span className="mt-2 block text-xs text-slate-400">◷ {service.durationMinutes} min · {selectedBusiness.address ?? 'Ubicación del negocio'}</span>
                            </span>
                          </span>
                          <span className="shrink-0 font-display font-bold text-[#f9c784]">{formatCop(service.price)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedBusiness && currentBusinessStylists.length > 0 && (
              <label className="block text-sm font-semibold text-slate-200">
                Profesional <span className="font-normal text-slate-400">(opcional)</span>
                <select value={stylistId} onChange={(event) => {
                  setStylistId(event.target.value);
                  setSelectedSlot('');
                  setBlockedSlots([]);
                  setQueriedAvailabilityKey('');
                }} className={fieldClass}>
                  <option value="">Cualquier profesional disponible</option>
                  {currentBusinessStylists.map((stylist, index) => <option key={stylist.id} value={stylist.id}>{stylist.name?.trim() || `Profesional ${index + 1}`} · {stylist.specialty}</option>)}
                </select>
              </label>
            )}

            <div className="rounded-2xl border border-white/5 bg-[#0f172a]/70 p-4">
              <div className="flex items-center justify-between text-sm"><span className="text-slate-300">Subtotal del servicio</span><span className="font-semibold">{selectedService ? formatCop(selectedService.price) : '—'}</span></div>
              <p className="mt-2 text-xs text-slate-500">El beneficio de primera cita se valida al confirmar y se muestra en el resumen.</p>
            </div>
          </section>
        ) : (
          <section className="space-y-5 rounded-3xl border border-white/10 bg-[#172033] p-4 shadow-xl shadow-black/10 sm:p-6">
            <div className="flex items-center gap-4 rounded-2xl bg-[#0f172a] p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-xl text-[#f9c784]">✦</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold">{selectedBusiness?.name}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{selectedService?.name}{selectedStylist ? ` · ${selectedStylist.name?.trim() || 'Profesional'} · ${selectedStylist.specialty}` : ''}</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-[#f9c784] hover:underline">Cambiar</button>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div><h2 className="font-display text-xl font-bold">Selecciona tu día</h2><p className="mt-1 text-xs text-slate-400">Disponibilidad sincronizada con el negocio.</p></div>
              <span className="text-xs font-semibold text-[#f9c784]">◷ {selectedService?.durationMinutes} min</span>
            </div>
            <label className="block text-sm font-semibold text-slate-200">
              Fecha de la cita
              <input required type="date" min={localDateString()} value={date} onClick={(event) => event.currentTarget.showPicker()} onChange={(event) => {
                setDate(event.target.value);
                setDateError(null);
                setSelectedSlot('');
                setBlockedSlots([]);
                setReservationNotice(null);
                setInvalidAvailabilityKey('');
                setQueriedAvailabilityKey('');
              }} className={`${fieldClass} cursor-pointer [color-scheme:dark]`} />
            </label>
            <section aria-live="polite" className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-4">
              <h3 className="text-sm font-semibold text-slate-100">Horario de atención del negocio</h3>
              {loading.schedule ? (
                <p className="mt-2 text-sm text-slate-400">Cargando horario…</p>
              ) : currentBusinessSchedule?.intervals.length ? (
                <>
                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {groupBusinessSchedule(currentBusinessSchedule.intervals).map((group) => (
                      <li key={`${group.days.join('-')}-${group.hours}`}>
                        <span className="font-semibold text-white">{group.days.length > 1 ? `${group.days[0]}–${group.days[group.days.length - 1]}` : group.days[0]}:</span>{' '}
                        {group.hours}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">Horas locales del negocio · {currentBusinessSchedule.timeZone}</p>
                </>
              ) : currentBusinessSchedule ? (
                <p className="mt-2 text-sm text-amber-200">Este negocio todavía no tiene un horario de atención configurado.</p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">No pudimos cargar el horario ahora. Puedes consultar los turnos disponibles para una fecha.</p>
              )}
            </section>
            <button type="button" onClick={searchAvailability} disabled={!date || loading.availability || (queriedAvailabilityKey === currentAvailabilityKey && visibleAvailabilitySlots.length === 0)} className="w-full rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-4 py-3 font-semibold text-emerald-200 transition hover:bg-[#10b981]/20 disabled:cursor-not-allowed disabled:opacity-50">
              {loading.availability
                ? 'Consultando disponibilidad…'
                : queriedAvailabilityKey === currentAvailabilityKey && visibleAvailabilitySlots.length === 0
                  ? 'Sin horarios para esta fecha'
                  : 'Consultar horarios disponibles'}
            </button>
            {dateError && <p role="alert" className="text-sm text-red-300">{dateError}</p>}

            {slotGroups.length > 0 ? (
              <div className="space-y-5">
                {slotGroups.map(({ title, icon, slots }) => slots.length > 0 && (
                  <section key={title}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-display text-sm font-bold text-slate-100">{icon} {title}</h3>
                      <span className="text-xs text-slate-400">{formatTime(slots[0])} – {formatTime(slots[slots.length - 1])}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {slots.map((slot) => {
                        const value = slot.startsAt.toDate().toISOString();
                        const selected = value === selectedSlot;
                        return <button key={value} type="button" aria-pressed={selected} onClick={() => setSelectedSlot(value)} className={`rounded-xl border px-3 py-3 text-left transition ${selected ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f172a]' : 'border-white/10 bg-[#0f172a] hover:border-[#f59e0b]/70'}`}>
                          <span className="block font-display text-sm font-bold">{formatTime(slot)}</span>
                          <span className={`mt-1 block text-xs ${selected ? 'text-slate-800' : 'text-emerald-300'}`}>{selected ? 'Seleccionado ✓' : 'Disponible'}</span>
                        </button>;
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : queriedAvailabilityKey === currentAvailabilityKey && !loading.availability ? (
              <p className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-sm text-slate-300">{invalidAvailabilityKey === currentAvailabilityKey
                ? 'Los horarios recibidos no coinciden con el horario vigente del negocio. No hay turnos para ofrecer en esta fecha; elige otra fecha.'
                : date === localDateString()
                  ? 'Ya no quedan horarios disponibles para hoy. Elige otra fecha para continuar.'
                  : 'Este negocio no tiene turnos disponibles para esta fecha. Puede estar cerrado o tener todos sus turnos ocupados. Elige otra fecha.'}</p>
            ) : null}
            {reservationNotice && <p role="alert" className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">{reservationNotice}</p>}
            <label className="block text-sm font-semibold text-slate-200">
              Nota para el negocio <span className="font-normal text-slate-400">(opcional)</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={2} placeholder="Algo que debamos tener en cuenta" className={fieldClass} />
            </label>
          </section>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/25 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0f172a]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-400">{step === 1 ? selectedService?.name ?? 'Selecciona un servicio' : selectedSlot ? `${date} · ${formatSelectedTime(availabilitySlots, selectedSlot)}` : 'Selecciona un horario'}</p>
              <p className="mt-0.5 font-display font-bold text-[#f9c784]">{selectedService ? formatCop(selectedService.price) : '—'}</p>
            </div>
            {step === 2 && <button type="button" onClick={() => setStep(1)} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">Volver</button>}
            {step === 1 ? (
              <button type="button" disabled={!selectedBusiness || !selectedService} onClick={() => setStep(2)} className="rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">Elegir horario →</button>
            ) : (
              <button type="submit" disabled={!selectedSlot || loading.action} className="rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40">{loading.action ? 'Confirmando…' : 'Confirmar cita'}</button>
            )}
          </div>
        </div>
      </form>
      {loading.list && <p className="mt-4 text-center text-sm text-slate-400">Cargando negocios…</p>}
    </main>
  );
}

function ConfirmationScreen({
  appointment,
  businessName,
  businessAddress,
  serviceName,
  stylistName,
  onBookAgain,
}: {
  appointment: Appointment;
  businessName: string;
  businessAddress: string | null;
  serviceName: string;
  stylistName: string | null;
  onBookAgain: () => void;
}) {
  const start = appointment.startsAt.toDate();
  const end = new Date(start.getTime() + appointment.duration.minutes * 60_000);
  const calendarDate = `${toCalendarDate(start)}/${toCalendarDate(end)}`;
  const calendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: `${serviceName} · LookVibe`,
    dates: calendarDate,
    details: `Cita en ${businessName}${stylistName ? ` con ${stylistName}` : ''}.`,
    location: businessAddress ?? businessName,
  })}`;
  const mapUrl = businessAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessAddress)}`
    : null;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 text-white sm:px-6">
      <section className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#10b981] text-3xl text-[#0f172a] shadow-lg shadow-emerald-950/30">✓</span>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">¡Tu cita está confirmada!</h1>
        <p className="mt-2 text-sm text-slate-300">Guarda los detalles y llega a tiempo a tu servicio.</p>
      </section>

      <article className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#172033]">
        <div className="h-1.5 bg-gradient-to-r from-[#f59e0b] via-[#10b981] to-[#d97706]" />
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f9c784]">Lugar de la cita</p>
          <h2 className="mt-2 font-display text-xl font-bold">{businessName}</h2>
          {businessAddress && <p className="mt-1 text-sm text-slate-400">{businessAddress}</p>}
          {stylistName && <p className="mt-4 text-sm text-slate-300">Profesional: <span className="font-semibold text-white">{stylistName}</span></p>}
          {appointment.welcomeBenefitApplied && (
            <p className="mt-4 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-2 text-sm font-semibold text-emerald-200">
              ✓ Beneficio de primera cita aplicado · 10% de descuento
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <DetailTile label="Fecha y hora" value={formatBogotaDateTime(start)} />
            <DetailTile label="Servicio" value={serviceName} />
            <DetailTile label="Duración" value={`${appointment.duration.minutes} min`} />
          </div>
          <div className="mt-3 space-y-2 rounded-2xl bg-[#0f172a] p-4 text-sm">
            <PriceLine label="Tarifa del servicio" amount={appointment.price.base} />
            <PriceLine label="Descuento de bienvenida" amount={appointment.price.welcomeDiscount} discount />
            <div className="my-2 border-t border-white/10" />
            <div className="flex items-center justify-between font-display font-bold"><span>Total a pagar</span><span className="text-lg text-[#f9c784]">{appointment.price.total === null ? 'Por confirmar' : formatCop(appointment.price.total)}</span></div>
          </div>
          <div className="mt-4 rounded-2xl bg-[#0f172a] p-4">
            <p className="text-xs text-slate-400">Código de reserva</p>
            <p className="mt-1 font-display text-lg font-bold tracking-wider text-[#f9c784]">#LV-{appointment.id.slice(0, 6).toUpperCase()}</p>
          </div>
        </div>
      </article>

      <div className="mt-5 grid gap-3">
        <a href={calendarUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#f59e0b] px-4 py-3.5 text-center font-display font-bold text-[#0f172a] transition hover:bg-amber-300">＋ Agregar al calendario</a>
        {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-[#172033] px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-white/10">↗ Cómo llegar · Abrir mapa</a>}
        <Link href="/appointments" className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/5">Ver mis citas</Link>
        <button type="button" onClick={onBookAgain} className="px-4 py-2 text-sm font-semibold text-[#f9c784] hover:text-white">Agendar otra cita</button>
      </div>
    </main>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return <div className="min-h-20 rounded-2xl bg-[#0f172a] p-3"><p className="text-[11px] text-slate-400">{label}</p><p className="mt-1 font-display text-sm font-semibold text-white">{value}</p></div>;
}

function PriceLine({ label, amount, discount = false }: { label: string; amount: number | null; discount?: boolean }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-slate-400">{label}</span><span className={discount && amount && amount > 0 ? 'font-semibold text-emerald-300' : 'text-slate-200'}>{amount === null ? '—' : `${discount && amount > 0 ? '−' : ''}${formatCop(amount)}`}</span></div>;
}

export function BookingForm(selection: BookingSelection) {
  return <AppointmentsProvider><BookingFormContent {...selection} /></AppointmentsProvider>;
}

const fieldClass = 'mt-2 block w-full rounded-xl border border-white/15 bg-[#0f172a] px-3 py-3 text-white outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-800';

function groupSlots(slots: AppointmentSlot[]) {
  const groups = [
    { title: 'Franja mañana', icon: '☀', slots: [] as AppointmentSlot[] },
    { title: 'Franja tarde', icon: '◒', slots: [] as AppointmentSlot[] },
    { title: 'Últimos turnos', icon: '↗', slots: [] as AppointmentSlot[] },
  ];
  for (const slot of slots) {
    const minute = minutesInTimeZone(slot.startsAt.toDate(), slot.timeZone);
    const group = minute < 12 * 60 ? groups[0] : minute < 17 * 60 ? groups[1] : groups[2];
    group.slots.push(slot);
  }
  return groups;
}

function minutesInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

function formatTime(slot: AppointmentSlot): string {
  return slot.startsAt.toDate().toLocaleTimeString('en-US', { timeZone: slot.timeZone, hour: '2-digit', minute: '2-digit' });
}

function formatSelectedTime(slots: AppointmentSlot[], selectedIso: string): string {
  const slot = slots.find((item) => item.startsAt.isoValue === selectedIso);
  return slot ? formatTime(slot) : '';
}

function formatCop(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}

function formatBogotaDateTime(date: Date): string {
  return date.toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
}

function toCalendarDate(date: Date): string {
  return date.toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}Z$/, 'Z');
}

function getAvailabilityKey(businessId: string, serviceId: string, stylistId: string, date: string): string {
  return JSON.stringify([businessId, serviceId, stylistId, date]);
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

function groupBusinessSchedule(intervals: readonly { dayOfWeek: number; startTime: string; endTime: string }[]) {
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
