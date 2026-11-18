import type { PortfolioItem } from '../../domain/entities/portfolio-item';

export function PortfolioGallery({ items }: { items: readonly PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-[#172033] p-5 text-sm text-slate-400">
        Todavía no hay fotos en el portafolio.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#172033]">
          <a href={item.photoUrl.value} target="_blank" rel="noreferrer" className="block">
            <span
              role="img"
              aria-label={item.description ?? 'Foto del portafolio'}
              style={{ backgroundImage: `url("${item.photoUrl.value}")` }}
              className="block aspect-square w-full bg-[#0f172a] bg-cover bg-center transition hover:opacity-90"
            />
          </a>
          {item.description && <p className="p-3 text-xs text-slate-300">{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}
