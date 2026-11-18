'use client';

import { useReviewPermissions } from '../hooks/use-review-permissions';

function useSeesReports(): { visible: boolean; canModerate: boolean } {
  const { canModerate, canReport } = useReviewPermissions();
  return { visible: canModerate || canReport, canModerate };
}

export function ReportedReviewsNotice({ count }: { count: number }) {
  const { visible, canModerate } = useSeesReports();
  if (count === 0 || !visible) return null;

  return (
    <p role="status" className="rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/5 p-4 text-sm text-amber-100">
      <strong className="text-[#f9c784]">
        ⚑ {count} {count === 1 ? 'reseña reportada' : 'reseñas reportadas'}.
      </strong>{' '}
      {canModerate
        ? 'Siguen visibles al público hasta que decidas eliminarlas por incumplir las políticas.'
        : 'Siguen visibles mientras un administrador decide si las elimina.'}
    </p>
  );
}

export function ReportedReviewBadge({ reported }: { reported: boolean }) {
  const { visible } = useSeesReports();
  if (!reported || !visible) return null;

  return (
    <span className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f9c784]">
      ⚑ Reportada · en revisión
    </span>
  );
}
