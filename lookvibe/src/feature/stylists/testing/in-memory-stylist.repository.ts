import type { StylistRepository } from '../application/repositories/stylist-repository';
import { Stylist, type StylistInput } from '../domain/entities/stylist';
import { AffiliationError } from '../domain/errors/affiliation-error';
import { StylistNotFoundError } from '../domain/errors/stylist-not-found-error';
import { StylistProfileExistsError } from '../domain/errors/stylist-profile-exists-error';
import type { StylistDraft } from '../domain/value-objects/stylist-draft';

export function aStylist(overrides: Partial<StylistInput> = {}): Stylist {
  return Stylist.create({
    id: 'e-1',
    name: 'Valentina Ruiz',
    specialty: 'Colorista',
    photoUrl: null,
    affiliation: 'AFILIADO',
    ...overrides,
  });
}

export class InMemoryStylistRepository implements StylistRepository {
  deleted: string[] = [];
  independent: Stylist | null = null;
  requests: { stylistId: string; businessId: string }[] = [];

  constructor(private readonly byBusiness: Record<string, Stylist[]> = {}) {}

  async findByBusiness(businessId: string): Promise<Stylist[]> {
    return this.byBusiness[businessId] ?? [];
  }

  async findManaged(businessId: string): Promise<Stylist[]> {
    return this.findByBusiness(businessId);
  }

  async createForBusiness(businessId: string, draft: StylistDraft): Promise<Stylist> {
    const stylist = aStylist({
      id: `e-${Date.now()}`,
      name: null,
      specialty: draft.specialty,
      photoUrl: draft.photoUrl,
      affiliation: 'INDEPENDIENTE',
    });
    this.byBusiness[businessId] = [...(this.byBusiness[businessId] ?? []), stylist];
    return stylist;
  }

  async findById(stylistId: string): Promise<Stylist> {
    const stylist = Object.values(this.byBusiness).flat().find((item) => item.id === stylistId);
    if (!stylist) throw new StylistNotFoundError(stylistId);
    return stylist;
  }

  async createIndependent(draft: StylistDraft): Promise<Stylist> {
    if (this.independent) throw new StylistProfileExistsError();
    this.independent = aStylist({ id: 'e-propio', specialty: draft.specialty, photoUrl: draft.photoUrl, affiliation: 'INDEPENDIENTE' });
    return this.independent;
  }

  async update(stylistId: string, draft: StylistDraft): Promise<Stylist> {
    return aStylist({ id: stylistId, specialty: draft.specialty, photoUrl: draft.photoUrl });
  }

  async delete(stylistId: string): Promise<void> {
    this.deleted.push(stylistId);
  }

  async requestAffiliation(stylistId: string, businessId: string): Promise<Stylist> {
    const stylist = await this.findById(stylistId);
    this.requests.push({ stylistId, businessId });
    return aStylist({ ...this.inputOf(stylist), affiliation: 'PENDIENTE', requestedBusiness: { id: businessId, name: 'Negocio' } });
  }

  async acceptAffiliation(businessId: string, stylistId: string): Promise<Stylist> {
    const request = this.requests.find((item) => item.stylistId === stylistId && item.businessId === businessId);
    if (!request) throw new AffiliationError('Ese estilista no ha pedido unirse a tu negocio.');
    const stylist = await this.findById(stylistId);
    return aStylist({ ...this.inputOf(stylist), affiliation: 'AFILIADO', business: { id: businessId, name: 'Negocio' }, requestedBusiness: null });
  }

  private inputOf(stylist: Stylist): StylistInput {
    return {
      id: stylist.id,
      name: stylist.name,
      specialty: stylist.specialty,
      photoUrl: stylist.photoUrl,
      affiliation: stylist.affiliation.value,
      business: stylist.business,
      requestedBusiness: stylist.requestedBusiness,
      accountId: stylist.accountId,
    };
  }
}
