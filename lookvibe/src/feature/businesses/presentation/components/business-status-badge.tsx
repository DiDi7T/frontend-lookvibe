import type { BusinessStatus } from '../../domain/value-objects/business-status';

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  return status.isActive ? (
    <span className="rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-1 text-xs font-semibold text-emerald-200">
      Recibiendo citas
    </span>
  ) : (
    <span className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-amber-200">
      En configuración
    </span>
  );
}
