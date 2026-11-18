import { BookingLink } from '../../../appointments/presentation/components/booking-link';
import type { Service } from '../../domain/entities/service';
import { formatServiceDuration, formatServicePrice } from './service-format';

export function ServiceMenu({ services, businessId }: { services: Service[]; businessId: string }) {
  if (services.length === 0) {
    return <p className="mt-4 rounded-2xl border border-white/10 bg-[#172033] p-5 text-sm text-slate-400">Este negocio todavía no publica servicios.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {services.map((service) => (
        <li key={service.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#172033] p-5">
          <div className="min-w-0">
            <p className="font-display font-semibold">{service.name}</p>
            <p className="mt-1 text-sm text-slate-400">◷ {formatServiceDuration(service)}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="shrink-0 font-display text-lg font-bold text-[#f9c784]">{formatServicePrice(service)}</p>
            <BookingLink businessId={businessId} serviceId={service.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
