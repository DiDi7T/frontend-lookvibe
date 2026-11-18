'use client';

import { useEffect, useState } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import type { Service } from '../../domain/entities/service';
import type { ServiceDraftInput } from '../../domain/value-objects/service-draft';
import { ServicesProvider, useServices } from '../hooks/use-services';
import { formatServiceDuration, formatServicePrice } from './service-format';
import { ServiceForm } from './service-form';

function ServiceManagerContent({ businessId }: { businessId: string }) {
  const { services, loading, error, success, loadManagedServices, createService, updateService, deleteService } =
    useServices();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void loadManagedServices(businessId);
  }, [businessId, loadManagedServices]);

  function create(input: ServiceDraftInput) {
    return createService({ ...input, businessId });
  }

  async function update(service: Service, input: ServiceDraftInput) {
    const saved = await updateService({ ...input, businessId, serviceId: service.id });
    if (saved) setEditingId(null);
    return saved;
  }

  async function remove(service: Service) {
    if (await deleteService({ businessId, serviceId: service.id })) setConfirmDeleteId(null);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Servicios</h2>
      <p className="mt-1 text-sm text-slate-400">Lo que tus clientes pueden reservar, con su precio y duración.</p>
      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0f172a] p-5">
        <h3 className="mb-4 font-display font-semibold">Nuevo servicio</h3>
        <ServiceForm submitting={loading.action} onSubmit={create} />
      </div>

      {loading.list && <p className="mt-6 text-center text-sm text-slate-400">Cargando servicios…</p>}
      {!loading.list && services.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">Todavía no has agregado servicios.</p>
      )}

      <ul className="mt-6 space-y-3">
        {services.map((service) => (
          <li key={service.id} className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            {editingId === service.id ? (
              <ServiceForm
                service={service}
                submitting={loading.action}
                onSubmit={(input) => update(service, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">{service.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatServicePrice(service)} · {formatServiceDuration(service)}
                  </p>
                </div>
                {confirmDeleteId === service.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-red-200">¿Eliminar este servicio?</span>
                    <button
                      type="button"
                      onClick={() => remove(service)}
                      disabled={loading.action}
                      className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingId(service.id); setConfirmDeleteId(null); }}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmDeleteId(service.id); setEditingId(null); }}
                      className="rounded-xl border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-950/40"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServiceManager({ businessId }: { businessId: string }) {
  return <ServicesProvider><ServiceManagerContent businessId={businessId} /></ServicesProvider>;
}
