'use client';

import { useState, type FormEvent } from 'react';
import { inputClassName } from '../../../../shared/components/form-field';
import type { ScheduleIntervalInput } from '../../domain/value-objects/business-schedule';

interface DayState {
  dayOfWeek: number;
  label: string;
  open: boolean;
  startTime: string;
  endTime: string;
}

const INITIAL_DAYS: DayState[] = [
  { dayOfWeek: 1, label: 'Lunes', open: true, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 2, label: 'Martes', open: true, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 3, label: 'Miércoles', open: true, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 4, label: 'Jueves', open: true, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 5, label: 'Viernes', open: true, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 6, label: 'Sábado', open: true, startTime: '09:00', endTime: '14:00' },
  { dayOfWeek: 0, label: 'Domingo', open: false, startTime: '09:00', endTime: '13:00' },
];

interface BusinessScheduleFormProps {
  submitting: boolean;
  onSubmit: (intervals: ScheduleIntervalInput[]) => void;
}

export function BusinessScheduleForm({ submitting, onSubmit }: BusinessScheduleFormProps) {
  const [days, setDays] = useState<DayState[]>(INITIAL_DAYS);

  function update(dayOfWeek: number, changes: Partial<DayState>) {
    setDays((current) => current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(
      days
        .filter((day) => day.open)
        .map((day) => ({ dayOfWeek: day.dayOfWeek, startTime: day.startTime, endTime: day.endTime })),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-slate-400">
        Define los días y horas en que tu negocio recibe citas. Al guardar se reemplaza el horario anterior.
      </p>
      {days.map((day) => (
        <div
          key={day.dayOfWeek}
          className="grid items-center gap-3 rounded-2xl border border-white/5 bg-[#0f172a] p-4 sm:grid-cols-[10rem_1fr_1fr]"
        >
          <label className="flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={day.open}
              onChange={(event) => update(day.dayOfWeek, { open: event.target.checked })}
              className="size-4 accent-[#f59e0b]"
            />
            {day.label}
          </label>
          {day.open ? (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                Abre
                <input
                  type="time"
                  required
                  value={day.startTime}
                  onChange={(event) => update(day.dayOfWeek, { startTime: event.target.value })}
                  className={inputClassName}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                Cierra
                <input
                  type="time"
                  required
                  value={day.endTime}
                  onChange={(event) => update(day.dayOfWeek, { endTime: event.target.value })}
                  className={inputClassName}
                />
              </label>
            </>
          ) : (
            <p className="text-sm text-slate-500 sm:col-span-2">Cerrado</p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#f59e0b] px-6 py-3 font-display font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : 'Guardar horario'}
      </button>
    </form>
  );
}
