import type { SessionRepository } from '../../application/repositories/sesion-repository';
import { Session } from '../../domain/entities/session';

const SESSION_KEY = 'lookvibe_session';
const TOKEN_KEY = 'token';

export class LocalStorageSessionRepository implements SessionRepository {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  save(session: Session): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('lookvibe-session-change'));
  }

  getCurrentSession(): Session | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = window.localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('lookvibe-session-change'));
  }
}
