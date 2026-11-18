import type { Stylist } from '../../domain/entities/stylist';

export function StylistAvatar({ stylist }: { stylist: Stylist }) {
  if (stylist.photoUrl) {
    return (
      <span
        role="img"
        aria-label={stylist.displayName}
        style={{ backgroundImage: `url("${stylist.photoUrl}")` }}
        className="size-12 shrink-0 rounded-2xl bg-cover bg-center"
      />
    );
  }
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#10b981]/15 font-display font-bold text-emerald-300">
      {stylist.initials}
    </span>
  );
}
