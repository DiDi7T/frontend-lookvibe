import { InvalidStylistError } from '../errors/invalid-stylist-error';

export interface StylistDraftInput {
  specialty: string;
  photoUrl: string;
}

export class StylistDraft {
  private constructor(
    readonly specialty: string,
    readonly photoUrl: string | null,
  ) {}

  static create(input: StylistDraftInput): StylistDraft {
    const specialty = input.specialty.trim();
    if (!specialty) throw new InvalidStylistError('La especialidad es obligatoria.');
    if (specialty.length > 160) {
      throw new InvalidStylistError('La especialidad no puede superar 160 caracteres.');
    }
    return new StylistDraft(specialty, normalizePhotoUrl(input.photoUrl));
  }
}

export function normalizePhotoUrl(value: string | null): string | null {
  const url = value?.trim() ?? '';
  if (!url) return null;
  if (url.length > 2048) throw new InvalidStylistError('La URL de la foto es demasiado larga.');
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new InvalidStylistError('La foto debe ser una URL válida.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new InvalidStylistError('La foto debe ser una URL http o https.');
  }
  return url;
}
