'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteReview } from '../hooks/use-delete-review';
import { useReportReview } from '../hooks/use-report-review';
import { useReviewPermissions } from '../hooks/use-review-permissions';

type PendingAction = 'report' | 'delete' | null;

const CONFIRM_TEXT = {
  report: '¿Reportar esta reseña? Seguirá visible hasta que un administrador decida si la elimina.',
  delete: '¿Eliminar esta reseña por incumplir las políticas? No se puede deshacer.',
};

interface ReviewActionsProps {
  reviewId: string;
  reported: boolean;
  onDone?: () => void;
}

export function ReviewActions({ reviewId, reported, onDone }: ReviewActionsProps) {
  const router = useRouter();
  const { canModerate, canReport } = useReviewPermissions();
  const { report, reporting, error: reportError } = useReportReview();
  const { remove, deleting, error: deleteError } = useDeleteReview();
  const [pending, setPending] = useState<PendingAction>(null);
  const showReport = canReport && !reported;

  if (!canModerate && !showReport) return null;

  async function confirm() {
    const done = pending === 'delete' ? await remove(reviewId) : await report(reviewId);
    if (done) {
      setPending(null);
      if (onDone) onDone();
      else router.refresh();
    }
  }

  const error = reportError ?? deleteError;
  const busy = reporting || deleting;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {pending ? (
        <>
          <span className={`text-xs ${pending === 'delete' ? 'text-red-200' : 'text-amber-100'}`}>{CONFIRM_TEXT[pending]}</span>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              pending === 'delete' ? 'bg-red-500/90 text-white hover:bg-red-500' : 'bg-[#f59e0b] text-[#0f172a] hover:bg-amber-300'
            }`}
          >
            {busy ? 'Enviando…' : pending === 'delete' ? 'Sí, eliminar' : 'Sí, reportar'}
          </button>
          <button
            type="button"
            onClick={() => setPending(null)}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/5"
          >
            No
          </button>
        </>
      ) : (
        <>
          {showReport && (
            <button
              type="button"
              onClick={() => setPending('report')}
              className="rounded-lg border border-[#f59e0b]/30 px-3 py-1.5 text-xs font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
            >
              ⚑ Reportar reseña
            </button>
          )}
          {canModerate && (
            <button
              type="button"
              onClick={() => setPending('delete')}
              className="rounded-lg border border-red-300/30 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-950/40"
            >
              Moderar: eliminar reseña
            </button>
          )}
        </>
      )}
      {error && <p role="alert" className="w-full text-xs text-red-200">{error}</p>}
    </div>
  );
}
