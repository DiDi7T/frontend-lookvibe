'use client';

import { useCallback, useState } from 'react';
import { reviewsContainer } from '../../di/reviews.container';
import { toReviewErrorMessage } from './review-error-message';

export function useReportReview() {
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const report = useCallback(async (reviewId: string) => {
    setReporting(true);
    setError(null);
    try {
      await reviewsContainer.reportReview.execute(reviewId);
      return true;
    } catch (reason: unknown) {
      setError(toReviewErrorMessage(reason, 'No se pudo reportar la reseña.'));
      return false;
    } finally {
      setReporting(false);
    }
  }, []);

  return { report, reporting, error };
}
