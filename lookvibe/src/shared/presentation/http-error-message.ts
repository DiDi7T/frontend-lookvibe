import { HttpError } from '../infrastructure/http-client';

export function toHttpErrorMessage(reason: unknown, notFoundMessage: string): string | null {
  if (reason instanceof HttpError) {
    if (reason.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (reason.status === 403) return 'No tienes permiso para realizar esta acción.';
    if (reason.status === 404) return notFoundMessage;
    if (reason.status >= 500) return 'El servicio no está disponible en este momento.';
    return getResponseMessage(reason.body);
  }
  if (reason instanceof Error && reason.message === 'No autorizado') {
    return 'Tu sesión expiró. Inicia sesión nuevamente.';
  }
  if (reason instanceof Error && reason.message === 'Servicio no disponible') {
    return 'No fue posible conectar con el servicio. Inténtalo nuevamente.';
  }
  return null;
}

function getResponseMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) return body;
  if (typeof body !== 'object' || body === null || !('message' in body)) return null;
  const message = body.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ');
  }
  return null;
}
