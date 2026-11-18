'use client';

import { useCallback, useEffect, useState } from 'react';
import { reviewsContainer } from '../../di/reviews.container';
import type { ModerationQueue } from '../../domain/value-objects/moderation-queue';
import { toReviewErrorMessage } from './review-error-message';

export function useModerationQueue() {
  const [queue, setQueue] = useState<ModerationQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    reviewsContainer.getModerationQueue
      .execute()
      .then((result) => {
        if (!active) return;
        setQueue(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(toReviewErrorMessage(reason, 'No pudimos cargar las reseñas para moderar.'));
      });
    return () => {
      active = false;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const removeLocally = useCallback((reviewId: string) => {
    setQueue((current) => current?.without(reviewId) ?? current);
  }, []);

  return { queue, error, loading: queue === null && error === null, reload, removeLocally };
}
