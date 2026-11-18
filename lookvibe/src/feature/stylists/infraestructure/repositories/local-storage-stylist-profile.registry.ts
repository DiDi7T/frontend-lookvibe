import type { StylistProfileRegistry } from '../../application/repositories/stylist-profile-registry';

const KEY_PREFIX = 'lookvibe_stylist_profile_';

export class LocalStorageStylistProfileRegistry implements StylistProfileRegistry {
  findProfileId(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(KEY_PREFIX + userId);
    } catch {
      return null;
    }
  }

  rememberProfileId(userId: string, stylistId: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(KEY_PREFIX + userId, stylistId);
    } catch {
      return;
    }
  }
}
