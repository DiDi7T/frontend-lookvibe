import { InvalidStylistError } from '../errors/invalid-stylist-error';
import { AffiliationStatus } from '../value-objects/affiliation-status';
import { normalizePhotoUrl } from '../value-objects/stylist-draft';

export interface StylistBusinessSummary {
  readonly id: string;
  readonly name: string;
  readonly ownerId?: string | null;
}

export interface StylistInput {
  id: string;
  name: string | null;
  specialty: string;
  photoUrl: string | null;
  affiliation: string;
  business?: StylistBusinessSummary | null;
  requestedBusiness?: StylistBusinessSummary | null;
  accountId?: string | null;
}

export class Stylist {
  private constructor(
    readonly id: string,
    readonly name: string | null,
    readonly specialty: string,
    readonly photoUrl: string | null,
    readonly affiliation: AffiliationStatus,
    readonly business: StylistBusinessSummary | null,
    readonly requestedBusiness: StylistBusinessSummary | null,
    readonly accountId: string | null,
  ) {}

  static create(input: StylistInput): Stylist {
    const id = input.id.trim();
    if (!id) throw new InvalidStylistError('El estilista no tiene un identificador válido.');

    const specialty = input.specialty.trim();
    if (!specialty) throw new InvalidStylistError('El estilista debe tener una especialidad.');

    return new Stylist(
      id,
      input.name?.trim() || null,
      specialty,
      normalizePhotoUrl(input.photoUrl),
      AffiliationStatus.create(input.affiliation),
      input.business ?? null,
      input.requestedBusiness ?? null,
      input.accountId?.trim() || null,
    );
  }

  canBeManagedBy(userId: string, roles: readonly string[]): boolean {
    if (roles.includes('admin')) return true;
    if (this.isOwnedBy(userId)) return true;
    return Boolean(this.business?.ownerId) && this.business?.ownerId === userId;
  }

  isOwnedBy(userId: string): boolean {
    return this.accountId !== null && this.accountId === userId;
  }

  get hasPendingRequest(): boolean {
    return this.affiliation.value === 'PENDIENTE' && this.requestedBusiness !== null;
  }

  get canRequestAffiliation(): boolean {
    return this.accountId !== null && this.business === null;
  }

  get displayName(): string {
    return this.name ?? this.specialty;
  }

  get initials(): string {
    return this.displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toLocaleUpperCase('es'))
      .join('');
  }

  get isIndependent(): boolean {
    return this.business === null;
  }
}
