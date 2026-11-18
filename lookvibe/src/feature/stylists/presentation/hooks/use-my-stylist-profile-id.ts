'use client';

import { stylistsContainer } from '../../di/stylists.container';

export function useMyStylistProfileId(userId: string | null): string | null {
  return userId ? stylistsContainer.getMyStylistProfileId.execute(userId) : null;
}
