'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { businessesContainer } from '../../../businesses/di/businesses.container';
import { ReviewManagers, type ReviewManagersInput } from '../../domain/value-objects/review-managers';

interface ReviewPermissions {
  canModerate: boolean;
  canReport: boolean;
}

interface OwnedBusinesses {
  userId: string;
  ids: string[];
}

const ReviewPermissionsContext = createContext<ReviewPermissions>({ canModerate: false, canReport: false });

export function ReviewPermissionsProvider({ managers, children }: { managers: ReviewManagersInput; children: ReactNode }) {
  const session = useCurrentSession();
  const [owned, setOwned] = useState<OwnedBusinesses | null>(null);
  const reviewManagers = useMemo(
    () => ReviewManagers.create(managers),
    [managers],
  );
  const userId = session?.userId ?? null;
  const ownsBusinesses = session?.roles.includes('negocio') ?? false;
  const needsOwnership = userId !== null && ownsBusinesses && reviewManagers.businessId !== null;

  useEffect(() => {
    if (!needsOwnership || userId === null) return;
    let active = true;
    businessesContainer.getMyBusinesses
      .execute()
      .then((businesses) => {
        if (active) setOwned({ userId, ids: businesses.map((business) => business.id) });
      })
      .catch(() => {
        if (active) setOwned({ userId, ids: [] });
      });
    return () => {
      active = false;
    };
  }, [needsOwnership, userId]);

  const permissions = useMemo<ReviewPermissions>(() => {
    if (!session) return { canModerate: false, canReport: false };
    const ownedIds = owned?.userId === session.userId ? owned.ids : [];
    return {
      canModerate: session.roles.includes('admin'),
      canReport: reviewManagers.includes(session.userId, ownedIds),
    };
  }, [session, owned, reviewManagers]);

  return <ReviewPermissionsContext.Provider value={permissions}>{children}</ReviewPermissionsContext.Provider>;
}

export function useReviewPermissions(): ReviewPermissions {
  return useContext(ReviewPermissionsContext);
}
