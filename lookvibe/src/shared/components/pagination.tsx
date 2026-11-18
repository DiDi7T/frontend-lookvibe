import Link from 'next/link';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}

export function Pagination({ basePath, page, totalPages, params = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set('page', String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const baseClass = 'flex min-w-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition';

  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${baseClass} border border-white/10 text-slate-200 hover:border-[#f59e0b]/60`}>
          ← Anterior
        </Link>
      ) : (
        <span className={`${baseClass} border border-white/5 text-slate-600`}>← Anterior</span>
      )}
      {pages.map((item) => (
        <Link
          key={item}
          href={hrefFor(item)}
          aria-current={item === page ? 'page' : undefined}
          className={`${baseClass} ${item === page ? 'bg-[#f59e0b] text-[#0f172a]' : 'border border-white/10 text-slate-200 hover:border-[#f59e0b]/60'}`}
        >
          {item}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${baseClass} border border-white/10 text-slate-200 hover:border-[#f59e0b]/60`}>
          Siguiente →
        </Link>
      ) : (
        <span className={`${baseClass} border border-white/5 text-slate-600`}>Siguiente →</span>
      )}
    </nav>
  );
}
