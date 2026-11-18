'use client';

import { useEffect, useState } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { businessesContainer } from '../../di/businesses.container';

interface OwnedBusinesses {
  userId: string;
  ids: readonly string[];
}

export function useOwnsBusiness(businessId: string | null | undefined): boolean {
  const session = useCurrentSession();
  const [owned, setOwned] = useState<OwnedBusinesses | null>(null);
  const userId = session?.userId ?? null;
  const isBusinessAccount = session?.roles.includes('negocio') ?? false;
  const shouldCheck = userId !== null && isBusinessAccount && Boolean(businessId);

  useEffect(() => {
    if (!shouldCheck || userId === null) return;
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
  }, [shouldCheck, userId]);

  if (!shouldCheck || !businessId || owned?.userId !== userId) return false;
  return owned.ids.includes(businessId);
}
