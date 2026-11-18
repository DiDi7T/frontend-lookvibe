'use client';

import { useCallback, useState } from 'react';
import { reviewsContainer } from '../../di/reviews.container';
import { toReviewErrorMessage } from './review-error-message';

export function useDeleteReview() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (reviewId: string) => {
    setDeleting(true);
    setError(null);
    try {
      await reviewsContainer.deleteReview.execute(reviewId);
      return true;
    } catch (reason: unknown) {
      setError(toReviewErrorMessage(reason, 'No se pudo eliminar la reseña.'));
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { remove, deleting, error };
}
