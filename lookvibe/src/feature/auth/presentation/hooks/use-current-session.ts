'use client';

import { useSyncExternalStore } from 'react';
import type { Session } from '../../domain/entities/session';
import { authContainer } from '../../di/auth.container';

let cachedSessionJson: string | null | undefined;
let cachedSession: Session | null = null;

export function useCurrentSession(): Session | null {
  return useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => null,
  );
}

function getSessionSnapshot(): Session | null {
  const current = authContainer.sessionRepository.getCurrentSession();
  const serialized = current ? JSON.stringify(current) : null;
  if (serialized !== cachedSessionJson) {
    cachedSessionJson = serialized;
    cachedSession = current;
  }
  return cachedSession;
}

function subscribeToSession(onChange: () => void): () => void {
  window.addEventListener('lookvibe-session-change', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('lookvibe-session-change', onChange);
    window.removeEventListener('storage', onChange);
  };
}
