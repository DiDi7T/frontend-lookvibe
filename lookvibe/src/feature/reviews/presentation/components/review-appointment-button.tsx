'use client';

import { useState } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { reviewsContainer } from '../../di/reviews.container';
import { useCreateReview } from '../hooks/use-create-review';
import { ReviewForm, type ReviewFormValues } from './review-form';

interface ReviewAppointmentButtonProps {
  appointmentId: string;
  businessName: string | null;
}

export function ReviewAppointmentButton({ appointmentId, businessName }: ReviewAppointmentButtonProps) {
  const session = useCurrentSession();
  const { create, sending, error } = useCreateReview();
  const [open, setOpen] = useState(false);
  const [published, setPublished] = useState(false);

  if (!session?.roles.includes('cliente')) return null;

  const alreadyReviewed = published || reviewsContainer.hasReviewedAppointment.execute(session.userId, appointmentId);

  if (alreadyReviewed) {
    return (
      <p role="status" className="mt-3 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-emerald-200">
        ★ {published ? '¡Gracias! Tu reseña ya está publicada.' : 'Ya calificaste esta cita.'}
      </p>
    );
  }

  const userId = session.userId;

  async function submit(values: ReviewFormValues) {
    const created = await create({ ...values, appointmentId, userId });
    if (created) {
      setPublished(true);
      setOpen(false);
    }
    return created;
  }

  if (open) {
    return (
      <ReviewForm
        title={businessName ? `¿Cómo te fue en ${businessName}?` : '¿Cómo te fue en tu cita?'}
        sending={sending}
        error={error}
        onSubmit={submit}
        onCancel={() => setOpen(false)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mt-3 w-full rounded-xl bg-[#f59e0b] px-4 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-amber-300"
    >
      ★ Calificar mi cita
    </button>
  );
}
