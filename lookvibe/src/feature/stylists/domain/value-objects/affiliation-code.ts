import { InvalidStylistError } from '../errors/invalid-stylist-error';

const CODE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

export class AffiliationCode {
  private constructor(readonly value: string) {}

  static create(value: string, label: string): AffiliationCode {
    const code = value.trim();
    if (!code) throw new InvalidStylistError(`Pega el ${label}.`);
    if (!CODE_PATTERN.test(code)) {
      throw new InvalidStylistError(`El ${label} no es válido. Cópialo completo, tal como te lo enviaron.`);
    }
    return new AffiliationCode(code.toLowerCase());
  }

  static fromInviteToken(token: string): AffiliationCode {
    const text = token.trim();
    if (!TOKEN_PATTERN.test(text)) throw new InvalidStylistError('Este enlace de invitación no es válido.');
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '==');
    const hex = Array.from(binary, (char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    if (!CODE_PATTERN.test(uuid)) throw new InvalidStylistError('Este enlace de invitación no es válido.');
    return new AffiliationCode(uuid);
  }

  toInviteToken(): string {
    const bytes = this.value.replace(/-/g, '').match(/.{2}/g) ?? [];
    const binary = bytes.map((pair) => String.fromCharCode(parseInt(pair, 16))).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
