import { Session } from '../../domain/entities/session';

export interface SessionRepository {
  getAccessToken(): string | null;
  save(session: Session): void;
  getCurrentSession(): Session | null;
  clear(): void;
}