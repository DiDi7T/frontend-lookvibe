import { InvalidBusinessError } from '../errors/invalid-business-error';

export interface ScheduleIntervalInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleInterval {
  readonly dayOfWeek: number;
  readonly startTime: string;
  readonly endTime: string;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_INTERVALS = 56;

export class BusinessSchedule {
  private constructor(
    readonly intervals: readonly ScheduleInterval[],
    readonly timeZone: string,
  ) {}

  static create(intervals: ScheduleIntervalInput[], timeZone = 'America/Bogota'): BusinessSchedule {
    if (intervals.length === 0) {
      throw new InvalidBusinessError('Agrega al menos un día de atención.');
    }
    if (intervals.length > MAX_INTERVALS) {
      throw new InvalidBusinessError('El horario no puede tener más de 56 franjas.');
    }

    const normalized = intervals.map(validateInterval);
    const byDay = new Map<number, ScheduleInterval[]>();
    for (const interval of normalized) {
      byDay.set(interval.dayOfWeek, [...(byDay.get(interval.dayOfWeek) ?? []), interval]);
    }
    for (const dayIntervals of byDay.values()) {
      const sorted = [...dayIntervals].sort((left, right) => left.startTime.localeCompare(right.startTime));
      for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index].startTime < sorted[index - 1].endTime) {
          throw new InvalidBusinessError('Las franjas de un mismo día no pueden cruzarse.');
        }
      }
    }

    return new BusinessSchedule(normalized, timeZone);
  }
}

function validateInterval(input: ScheduleIntervalInput): ScheduleInterval {
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    throw new InvalidBusinessError('El día de la semana no es válido.');
  }
  if (!TIME_PATTERN.test(input.startTime) || !TIME_PATTERN.test(input.endTime)) {
    throw new InvalidBusinessError('Las horas deben tener el formato HH:MM.');
  }
  if (input.startTime >= input.endTime) {
    throw new InvalidBusinessError('La hora de cierre debe ser posterior a la de apertura.');
  }
  return { dayOfWeek: input.dayOfWeek, startTime: input.startTime, endTime: input.endTime };
}
