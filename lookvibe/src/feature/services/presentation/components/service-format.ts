import { formatCurrency, formatDuration } from '../../../../shared/presentation/formatters';
import type { Service } from '../../domain/entities/service';

export function formatServicePrice(service: Service): string {
  return formatCurrency(service.price.amount);
}

export function formatServiceDuration(service: Service): string {
  return formatDuration(service.duration.minutes);
}
