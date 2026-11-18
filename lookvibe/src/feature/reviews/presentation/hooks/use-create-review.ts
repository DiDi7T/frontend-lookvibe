'use client';

import { useCallback, useState } from 'react';
import type { CreateReviewInput } from '../../application/use-cases/create-review.use-case';
import { reviewsContainer } from '../../di/reviews.container';
import { toReviewErrorMessage } from './review-error-message';

export function useCreateReview() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateReviewInput) => {
    setSending(true);
    setError(null);
    try {
      await reviewsContainer.createReview.execute(input);
      return true;
    } catch (reason: unknown) {
      setError(toReviewErrorMessage(reason, 'No se pudo publicar tu reseña.'));
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { create, sending, error };
}
