'use client';

import Link from 'next/link';
import { useCurrentSession } from '../hooks/use-current-session';
import { canBookAppointments } from '../../../appointments/domain/value-objects/booking-access';

const roleCopy: Record<string, { title: string; description: string }> = {
  cliente: {
    title: 'Tu próximo momento de cuidado empieza aquí.',
    description: 'Encuentra servicios de belleza y agenda con el negocio y el horario que mejor se ajusten a ti.',
  },
  negocio: {
    title: 'Haz crecer la experiencia de tu negocio.',
    description: 'LookVibe conecta los negocios de belleza con las personas que buscan su próximo servicio.',
  },
  estilista: {
    title: 'Tu talento merece ser descubierto.',
    description: 'LookVibe acerca tu trabajo a las personas que buscan profesionales de belleza.',
  },
  admin: {
    title: 'Bienvenido a LookVibe.',
    description: 'Administra y acompaña la experiencia de belleza desde tu espacio de trabajo.',
  },
};

export function HomeContent() {
  const session = useCurrentSession();
  const role = session?.roles[0] ?? '';
  const copy = roleCopy[role] ?? {
    title: 'Tu próximo momento de cuidado empieza aquí.',
    description: 'Descubre servicios de belleza y encuentra un horario que se ajuste a ti.',
  };
  const canBook = canBookAppointments(session?.roles);

  return (
    <main className="relative flex flex-1 items-center overflow-hidden bg-[#0f172a] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 size-[32rem] rounded-full bg-[#f59e0b]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-24 size-[30rem] rounded-full bg-[#10b981]/10 blur-3xl" />
      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-2 text-sm font-semibold text-amber-200">
            <span className="size-2 rounded-full bg-[#10b981]" />
            Belleza, bienestar y estilo
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            {session ? `Hola, ${session.nombre || 'bienvenido'}.` : 'Tu belleza, a tu manera.'}
            <span className="mt-2 block text-[#f9c784]">{copy.title}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{copy.description}</p>

          {session ? (
            canBook ? (
              <Link href="/appointments/new" className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#f59e0b] px-6 py-4 font-display font-bold text-[#0f172a] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300">
                Reservar una cita <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <p className="mt-9 inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-slate-200">
                Tu espacio está personalizado para el rol de {role || 'usuario'}.
              </p>
            )
          ) : (
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-xl bg-[#f59e0b] px-6 py-4 font-display font-bold text-[#0f172a] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300">
                Crear una cuenta <span aria-hidden="true">→</span>
              </Link>
              <Link href="/login" className="inline-flex items-center rounded-xl border border-white/20 px-6 py-4 font-display font-semibold text-white transition hover:bg-white/10">
                Iniciar sesión
              </Link>
            </div>
          )}
          <p className="mt-8 text-sm text-slate-400">Un solo lugar para descubrir, conectar y reservar.</p>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-[2rem] border border-white/10 bg-[#172033] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm text-slate-400">Tu próxima experiencia</p>
                <p className="mt-1 font-display text-xl font-semibold">Un momento para ti</p>
              </div>
              <span className="rounded-full bg-[#10b981]/15 px-3 py-1 text-xs font-semibold text-emerald-300">LookVibe</span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-5">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-xl text-[#f9c784]">✦</span>
                  <div><p className="font-display font-semibold">Descubre servicios</p><p className="mt-1 text-sm text-slate-400">Encuentra algo ideal para ti</p></div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-5">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#10b981]/15 text-xl text-emerald-300">◷</span>
                  <div><p className="font-display font-semibold">Elige tu horario</p><p className="mt-1 text-sm text-slate-400">Consulta disponibilidad actualizada</p></div>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#10b981]" /></div>
              <p className="text-right text-xs text-slate-500">Tu próxima cita está a unos pasos</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
