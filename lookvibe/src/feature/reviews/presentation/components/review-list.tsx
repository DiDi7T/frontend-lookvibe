import type { ReviewManagersInput } from '../../domain/value-objects/review-managers';
import type { ReviewSummary } from '../../domain/value-objects/review-summary';
import { ReviewPermissionsProvider } from '../hooks/use-review-permissions';
import { ReportedReviewBadge, ReportedReviewsNotice } from './reported-review-markers';
import { ReviewActions } from './review-actions';
import { ReviewStars } from './review-stars';

const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

interface ReviewListProps {
  summary: ReviewSummary | null;
  managers: ReviewManagersInput;
}

export function ReviewList({ summary, managers }: ReviewListProps) {
  if (!summary) {
    return <p className="rounded-2xl border border-white/10 bg-[#172033] p-5 text-sm text-slate-400">No pudimos cargar las reseñas.</p>;
  }

  return (
    <ReviewPermissionsProvider managers={managers}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#172033] p-5">
          <span className="font-display text-3xl font-bold text-[#f9c784]">{summary.average?.toFixed(1) ?? '—'}</span>
          <div>
            {summary.average !== null && <ReviewStars value={Math.round(summary.average)} />}
            <p className="text-sm text-slate-400">
              {summary.count === 0 ? 'Aún no tiene reseñas' : `${summary.count} ${summary.count === 1 ? 'reseña' : 'reseñas'}`}
            </p>
          </div>
        </div>
        <ReportedReviewsNotice count={summary.reportedCount} />
        {summary.reviews.length > 0 && (
          <ul className="space-y-3">
            {summary.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-white/10 bg-[#172033] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">{review.author}</p>
                    <ReportedReviewBadge reported={review.reported} />
                  </div>
                  <ReviewStars value={review.rating.value} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{review.comment}</p>
                <p className="mt-2 text-xs text-slate-500">{dateFormatter.format(review.createdAt)}</p>
                <ReviewActions reviewId={review.id} reported={review.reported} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ReviewPermissionsProvider>
  );
}
