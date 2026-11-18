import { describe, expect, it } from 'vitest';
import { aStylist } from '../testing/in-memory-stylist.repository';
import { InvalidStylistError } from './errors/invalid-stylist-error';
import { AffiliationCode } from './value-objects/affiliation-code';
import { StylistDraft } from './value-objects/stylist-draft';

describe('Stylist', () => {
  it('usa el nombre de la cuenta y, si no hay, la especialidad', () => {
    expect(aStylist().displayName).toBe('Valentina Ruiz');
    expect(aStylist({ name: null, specialty: 'Barbero' }).displayName).toBe('Barbero');
  });

  it('calcula las iniciales para el avatar', () => {
    expect(aStylist().initials).toBe('VR');
  });

  it('no existe sin especialidad, con afiliación desconocida o con foto inválida', () => {
    expect(() => aStylist({ specialty: ' ' })).toThrow(InvalidStylistError);
    expect(() => aStylist({ affiliation: 'VETADO' })).toThrow(InvalidStylistError);
    expect(() => aStylist({ photoUrl: 'ftp://foto.png' })).toThrow(InvalidStylistError);
  });
});

describe('Stylist.canBeManagedBy', () => {
  const stylist = aStylist({ accountId: 'u-estilista', business: { id: 'b-1', name: 'Zen Spa', ownerId: 'u-dueno' } });

  it('lo administran su propia cuenta, el dueño de su negocio y el admin', () => {
    expect(stylist.canBeManagedBy('u-estilista', ['estilista'])).toBe(true);
    expect(stylist.canBeManagedBy('u-dueno', ['negocio'])).toBe(true);
    expect(stylist.canBeManagedBy('otro', ['admin'])).toBe(true);
  });

  it('nadie más puede administrarlo', () => {
    expect(stylist.canBeManagedBy('otro', ['negocio'])).toBe(false);
    expect(stylist.canBeManagedBy('otro', ['cliente'])).toBe(false);
    expect(aStylist({ accountId: null, business: null }).canBeManagedBy('otro', ['estilista'])).toBe(false);
  });
});

describe('StylistDraft', () => {
  it('acepta una foto vacía y valida la URL cuando se envía', () => {
    expect(StylistDraft.create({ specialty: 'Barbero', photoUrl: '' }).photoUrl).toBeNull();
    expect(StylistDraft.create({ specialty: 'Barbero', photoUrl: 'https://x.co/a.png' }).photoUrl).toBe('https://x.co/a.png');
    expect(() => StylistDraft.create({ specialty: 'Barbero', photoUrl: 'no es url' })).toThrow(InvalidStylistError);
  });

  it('limita la especialidad a 160 caracteres', () => {
    expect(() => StylistDraft.create({ specialty: 'x'.repeat(161), photoUrl: '' })).toThrow(InvalidStylistError);
  });
});

describe('AffiliationCode en enlaces de invitación', () => {
  const businessId = '0c31342c-11cb-4df8-bb09-5e0edc6e9024';

  it('camufla el código en un token corto y lo recupera igual', () => {
    const token = AffiliationCode.create(businessId, 'código').toInviteToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(token).not.toContain(businessId.slice(0, 8));
    expect(AffiliationCode.fromInviteToken(token).value).toBe(businessId);
  });

  it('rechaza enlaces dañados o incompletos', () => {
    expect(() => AffiliationCode.fromInviteToken('abc')).toThrow(InvalidStylistError);
    expect(() => AffiliationCode.fromInviteToken('!'.repeat(22))).toThrow(InvalidStylistError);
  });
});
