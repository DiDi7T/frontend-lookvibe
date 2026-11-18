export default function StylistLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12" aria-busy="true">
      <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
      <div className="mt-5 h-40 animate-pulse rounded-[2rem] border border-white/10 bg-[#172033]" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-64 animate-pulse rounded-3xl bg-[#172033]" />
        <div className="h-64 animate-pulse rounded-3xl bg-[#172033]" />
      </div>
      <p className="mt-6 text-center text-sm text-slate-400">Cargando perfil…</p>
    </main>
  );
}
