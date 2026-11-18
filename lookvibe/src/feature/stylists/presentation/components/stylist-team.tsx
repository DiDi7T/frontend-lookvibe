import Link from 'next/link';
import type { Stylist } from '../../domain/entities/stylist';
import { BookingLink } from '../../../appointments/presentation/components/booking-link';
import { StylistAvatar } from './stylist-avatar';

export function StylistTeam({ stylists, businessId }: { stylists: Stylist[]; businessId: string }) {
  if (stylists.length === 0) {
    return <p className="mt-4 rounded-2xl border border-white/10 bg-[#172033] p-5 text-sm text-slate-400">Este negocio todavía no presenta a su equipo.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {stylists.map((stylist) => (
        <li
          key={stylist.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#172033] p-4 transition hover:border-[#f59e0b]/50"
        >
          <Link href={`/stylists/${stylist.id}`} className="flex min-w-0 flex-1 items-center gap-4">
            <StylistAvatar stylist={stylist} />
            <div className="min-w-0">
              <p className="truncate font-display font-semibold">{stylist.displayName}</p>
              {stylist.name && <p className="mt-0.5 truncate text-sm text-slate-400">{stylist.specialty}</p>}
            </div>
          </Link>
          <BookingLink businessId={businessId} stylistId={stylist.id} />
        </li>
      ))}
    </ul>
  );
}
