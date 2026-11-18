'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import type { BusinessReport } from '../../domain/entities/business-report';
import type { UsageReport } from '../../domain/entities/usage-report';
import { useReports } from '../hooks/use-reports';

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat('es-CO');

export function ReportsDashboard() {
  const session = useCurrentSession();
  const {
    businesses,
    businessReport,
    loading,
    error,
    loadMyBusinesses,
    loadBusinessReport,
    downloadBusinessReport,
  } = useReports();
  const [businessId, setBusinessId] = useState('');
  const [initialPeriod] = useState(createDefaultPeriod);
  const [from, setFrom] = useState(initialPeriod.from);
  const [to, setTo] = useState(initialPeriod.to);
  const isAdmin = session?.roles.includes('admin') ?? false;

  useEffect(() => {
    if (!session || isAdmin) return;

    void (async () => {
      const ownBusinesses = await loadMyBusinesses();
      if (ownBusinesses[0]) {
        setBusinessId(ownBusinesses[0].id);
        await loadBusinessReport(ownBusinesses[0].id, initialPeriod.from, initialPeriod.to);
      }
    })();
  }, [initialPeriod, isAdmin, loadBusinessReport, loadMyBusinesses, session]);

  async function submitPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isAdmin || !businessId) return;
    await loadBusinessReport(businessId, from, to);
  }

  async function selectBusiness(id: string) {
    setBusinessId(id);
    if (id && from && to) await loadBusinessReport(id, from, to);
  }

  async function exportPdf() {
    const bytes = await downloadBusinessReport(businessId, from, to);
    if (!bytes) return;
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-negocio-${businessId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 text-white sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">LookVibe · analítica</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{isAdmin ? 'Uso de la plataforma' : 'Rendimiento del negocio'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {isAdmin ? 'Indicadores generales de actividad y crecimiento.' : 'Citas, servicios, ingresos estimados y reputación en un solo lugar.'}
          </p>
        </div>
        {!isAdmin && businessId && (
          <button type="button" onClick={() => { void exportPdf(); }} disabled={loading.download || !from || !to}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
            <span aria-hidden="true">↓</span>{loading.download ? 'Preparando PDF…' : 'Exportar PDF'}
          </button>
        )}
      </header>

      <FeedbackMessage type="error" message={error} />
      {isAdmin ? (
        <AdminUsageMetrics />
      ) : (
        <>
          <form onSubmit={submitPeriod} className="mb-7 grid gap-4 border-b border-white/10 pb-7 sm:grid-cols-[minmax(12rem,1fr)_repeat(2,minmax(9rem,12rem))_auto] sm:items-end">
            <label className="grid gap-2 text-sm text-slate-300">
              Negocio
              <select value={businessId} onChange={(event) => { void selectBusiness(event.target.value); }} disabled={loading.businesses || businesses.length === 0}
                className="min-h-11 rounded-lg border border-white/15 bg-[#131926] px-3 text-white outline-none focus:border-amber-400">
                {businesses.length === 0 && <option value="">{loading.businesses ? 'Cargando negocios…' : 'No tienes negocios registrados'}</option>}
                {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Desde
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required className="min-h-11 rounded-lg border border-white/15 bg-[#131926] px-3 text-white outline-none focus:border-amber-400" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Hasta
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} required className="min-h-11 rounded-lg border border-white/15 bg-[#131926] px-3 text-white outline-none focus:border-amber-400" />
            </label>
            <button type="submit" disabled={loading.report || !businessId || !from || !to}
              className="min-h-11 rounded-lg border border-emerald-400/50 px-5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50">
              {loading.report ? 'Consultando…' : 'Actualizar'}
            </button>
          </form>
          {loading.report && !businessReport ? <ReportSkeleton /> : businessReport ? <BusinessOverview report={businessReport} /> : !loading.businesses && businesses.length === 0 ? (
            <p className="border-l-2 border-amber-400 px-4 py-3 text-sm text-slate-300">Aún no hay negocios asociados a esta cuenta.</p>
          ) : null}
        </>
      )}
    </main>
  );
}

export function AdminUsageMetrics() {
  const { usageReport, loading, error, loadUsageReport } = useReports();

  useEffect(() => {
    void loadUsageReport();
  }, [loadUsageReport]);

  return (
    <section aria-labelledby="admin-usage-heading" className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="admin-usage-heading" className="font-display text-xl font-bold">Métricas globales</h2>
          <p className="mt-1 text-sm text-slate-400">Actividad general de LookVibe.</p>
        </div>
        {usageReport && <p className="text-xs text-slate-500">Actualizado {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(usageReport.generatedAt))}</p>}
      </header>
      <FeedbackMessage type="error" message={error} />
      <UsageOverview report={usageReport} loading={loading.usage} />
    </section>
  );
}

function BusinessOverview({ report }: { report: BusinessReport }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{report.business.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{report.period.startDate} – {report.period.endDate} · {report.timezone}</p>
        </div>
        <p className="text-sm text-slate-400">{report.reviewCount} reseñas verificadas</p>
      </div>
      <section aria-label="Indicadores del negocio" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Citas del período" value={integer.format(report.appointments.total)} accent="amber" />
        <Metric label="Ingresos estimados" value={currency.format(report.estimatedRevenue)} accent="emerald" />
        <Metric label="Calificación promedio" value={report.averageRating === null ? 'Sin reseñas' : `${report.averageRating.toFixed(1)} / 5`} accent="amber" />
        <Metric label="Servicio más solicitado" value={report.mostRequestedService?.name ?? 'Sin solicitudes'} detail={report.mostRequestedService ? `${integer.format(report.mostRequestedService.count)} citas` : undefined} accent="emerald" />
      </section>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="border-t border-white/10 pt-5">
          <h3 className="font-display text-lg font-bold">Citas por mes</h3>
          <SeriesChart points={report.appointments.monthly.map((point) => ({ label: point.period, value: point.total }))} color="amber" />
        </div>
        <div className="border-t border-white/10 pt-5">
          <h3 className="font-display text-lg font-bold">Estado de las citas</h3>
          <ul className="mt-5 space-y-4">
            <StatusRow label="Completadas" value={report.appointments.completed} total={report.appointments.total} color="bg-emerald-400" />
            <StatusRow label="Pendientes" value={report.appointments.pending} total={report.appointments.total} color="bg-amber-400" />
            <StatusRow label="Canceladas" value={report.appointments.cancelled} total={report.appointments.total} color="bg-rose-400" />
            <StatusRow label="No realizadas" value={report.appointments.notPerformed} total={report.appointments.total} color="bg-slate-400" />
          </ul>
        </div>
      </section>
      <section className="border-t border-white/10 pt-5">
        <h3 className="font-display text-lg font-bold">Citas por semana</h3>
        <SeriesChart points={report.appointments.weekly.map((point) => ({ label: point.period, value: point.total }))} color="emerald" />
      </section>
    </div>
  );
}

function UsageOverview({ report, loading }: { report: UsageReport | null; loading: boolean }) {
  if (loading && !report) return <ReportSkeleton />;
  if (!report) return null;
  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-400">Generado {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.generatedAt))}</p>
      <section aria-label="Indicadores globales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Usuarios" value={integer.format(report.users)} accent="amber" />
        <Metric label="Negocios activos" value={`${integer.format(report.activeBusinesses)} / ${integer.format(report.businesses)}`} accent="emerald" />
        <Metric label="Citas registradas" value={integer.format(report.appointments)} accent="amber" />
        <Metric label="Reseñas" value={integer.format(report.reviews)} accent="emerald" />
      </section>
      <section className="border-t border-white/10 pt-5">
        <h2 className="font-display text-lg font-bold">Actividad de citas por mes</h2>
        <SeriesChart points={report.appointmentsByMonth.map((point) => ({ label: point.period, value: point.appointments }))} color="emerald" />
      </section>
    </div>
  );
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail?: string; accent: 'amber' | 'emerald' }) {
  return (
    <article className="min-w-0 border-l-2 border-white/15 py-2 pl-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 break-words font-display text-2xl font-bold ${accent === 'amber' ? 'text-amber-300' : 'text-emerald-300'}`}>{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </article>
  );
}

function SeriesChart({ points, color }: { points: { label: string; value: number }[]; color: 'amber' | 'emerald' }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  if (points.length === 0) return <p className="mt-4 text-sm text-slate-500">Sin actividad en el período seleccionado.</p>;
  return (
    <div className="mt-5 space-y-3">
      {points.map((point) => (
        <div key={point.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
          <span className="truncate text-slate-400">{formatPeriod(point.label)}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.max(point.value > 0 ? 3 : 0, (point.value / max) * 100)}%` }} />
          </div>
          <span className="text-right tabular-nums text-slate-200">{integer.format(point.value)}</span>
        </div>
      ))}
    </div>
  );
}

function StatusRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const ratio = total > 0 ? value / total * 100 : 0;
  return (
    <li>
      <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="text-slate-300">{label}</span><span className="tabular-nums text-slate-400">{integer.format(value)}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full ${color}`} style={{ width: `${ratio}%` }} /></div>
    </li>
  );
}

function ReportSkeleton() {
  return <div aria-label="Cargando reportes" className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 border-l-2 border-white/10 bg-white/[0.03]" />)}</div>;
}

function createDefaultPeriod(): { from: string; to: string } {
  const end = new Date();
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

function formatPeriod(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(date);
}