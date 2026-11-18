'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import type { ScheduleIntervalInput } from '../../domain/value-objects/business-schedule';
import type { BusinessDraftInput } from '../../domain/value-objects/business-draft';
import { BusinessesProvider, useBusinesses } from '../hooks/use-businesses';
import { BusinessForm } from './business-form';
import { BusinessScheduleForm } from './business-schedule-form';
import { BusinessStatusBadge } from './business-status-badge';

type WorkspaceTab = 'details' | 'services' | 'stylists' | 'portfolio' | 'schedule';

const TABS: { id: WorkspaceTab; label: string }[] = [
  { id: 'details', label: 'Datos' },
  { id: 'services', label: 'Servicios' },
  { id: 'stylists', label: 'Equipo' },
  { id: 'portfolio', label: 'Portafolio' },
  { id: 'schedule', label: 'Horario' },
];

interface BusinessWorkspaceProps {
  businessId: string;
  servicesPanel: ReactNode;
  stylistsPanel: ReactNode;
  portfolioPanel: ReactNode;
}

function BusinessWorkspaceContent({ businessId, servicesPanel, stylistsPanel, portfolioPanel }: BusinessWorkspaceProps) {
  const { selectedBusiness, loading, error, success, loadMyBusiness, updateBusiness, saveSchedule, clearFeedback } =
    useBusinesses();
  const [tab, setTab] = useState<WorkspaceTab>('details');

  useEffect(() => {
    void loadMyBusiness(businessId);
  }, [businessId, loadMyBusiness]);

  function changeTab(next: WorkspaceTab) {
    clearFeedback();
    setTab(next);
  }

  async function save(input: BusinessDraftInput) {
    await updateBusiness({ ...input, id: businessId });
  }

  async function saveHours(intervals: ScheduleIntervalInput[]) {
    await saveSchedule({ businessId, intervals });
  }

  if (loading.detail && !selectedBusiness) {
    return <p className="mx-auto mt-16 text-center text-sm text-slate-400">Cargando tu negocio…</p>;
  }

  if (!selectedBusiness) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
        <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
          <h1 className="font-display text-2xl font-bold">No encontramos este negocio</h1>
          <p className="mt-2 text-sm text-slate-400">{error ?? 'Puede que no te pertenezca o que haya sido eliminado.'}</p>
          <Link href="/businesses/manage" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Volver a mis negocios</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <Link href="/businesses/manage" className="text-sm font-semibold text-slate-300 transition hover:text-white">
        ← Mis negocios
      </Link>
      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Administrar negocio</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{selectedBusiness.name}</h1>
        </div>
        <BusinessStatusBadge status={selectedBusiness.status} />
      </header>
      {selectedBusiness.missingSetup.length > 0 && (
        <p className="mt-4 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-4 text-sm text-amber-100">
          Tu negocio aparecerá en LookVibe cuando tenga {selectedBusiness.missingSetup.join(', ')}. Recuerda también definir el horario.
        </p>
      )}

      <div role="tablist" aria-label="Secciones del negocio" className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-[#172033] p-1.5 sm:grid-cols-5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => changeTab(item.id)}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === item.id ? 'bg-[#0f172a] text-[#f9c784]' : 'text-slate-400 hover:text-white'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {(tab === 'details' || tab === 'schedule') && (
        <>
          <FeedbackMessage type="error" message={error} />
          <FeedbackMessage type="success" message={success} />
        </>
      )}

      <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-6 sm:p-8">
        {tab === 'details' && (
          <BusinessForm
            key={selectedBusiness.id}
            business={selectedBusiness}
            submitting={loading.action}
            submitLabel="Guardar cambios"
            onSubmit={save}
          />
        )}
        {tab === 'services' && servicesPanel}
        {tab === 'stylists' && stylistsPanel}
        {tab === 'portfolio' && portfolioPanel}
        {tab === 'schedule' && <BusinessScheduleForm submitting={loading.action} onSubmit={saveHours} />}
      </section>
    </main>
  );
}

export function BusinessWorkspace(props: BusinessWorkspaceProps) {
  return <BusinessesProvider><BusinessWorkspaceContent {...props} /></BusinessesProvider>;
}
