export default function BusinessesLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12" aria-busy="true">
      <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-9 w-72 animate-pulse rounded-xl bg-white/10" />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="h-56 animate-pulse rounded-3xl border border-white/10 bg-[#172033]" />
        ))}
      </ul>
      <p className="mt-6 text-center text-sm text-slate-400">Cargando negocios…</p>
    </main>
  );
}
