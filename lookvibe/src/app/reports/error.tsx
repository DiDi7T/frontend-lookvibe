'use client';

export default function ReportsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="border-l-2 border-rose-400 pl-5">
        <h1 className="font-display text-2xl font-bold">No se pudo abrir reportes</h1>
        <p className="mt-2 text-sm text-slate-400">Ocurrió un error inesperado al preparar esta sección.</p>
        <button type="button" onClick={reset} className="mt-5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/5">Reintentar</button>
      </section>
    </main>
  );
}