'use client';

export default function StylistsError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-200">!</span>
        <h1 className="mt-4 font-display text-2xl font-bold">No pudimos cargar el perfil</h1>
        <p className="mt-2 text-sm text-slate-400">Revisa tu conexión o inténtalo de nuevo en unos minutos.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a] transition hover:bg-amber-300"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}
