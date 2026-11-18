import Link from 'next/link';

export default function BusinessNotFound() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f59e0b]/10 text-2xl text-[#f9c784]">✦</span>
        <h1 className="mt-4 font-display text-2xl font-bold">Este negocio no está disponible</h1>
        <p className="mt-2 text-sm text-slate-400">Puede que no exista o que todavía esté terminando su configuración.</p>
        <Link href="/businesses" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">
          Ver otros negocios
        </Link>
      </section>
    </main>
  );
}
