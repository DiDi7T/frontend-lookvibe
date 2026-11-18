import { InvalidReportError } from '../errors/invalid-report-error';

export class ReportPeriod {
  private constructor(
    readonly startDate: string,
    readonly endDate: string,
  ) {}

  static create(startDate: string, endDate: string): ReportPeriod {
    const start = startDate.trim();
    const end = endDate.trim();
    if (!isCalendarDate(start) || !isCalendarDate(end) || start > end) {
      throw new InvalidReportError('Selecciona un rango de fechas válido.');
    }
    return new ReportPeriod(start, end);
  }
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}