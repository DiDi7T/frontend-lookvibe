import type { Stylist } from '../../domain/entities/stylist';
import type { StylistDraft } from '../../domain/value-objects/stylist-draft';

export interface StylistRepository {
  findByBusiness(businessId: string): Promise<Stylist[]>;
  findManaged(businessId: string): Promise<Stylist[]>;
  findById(stylistId: string): Promise<Stylist>;
  createForBusiness(businessId: string, draft: StylistDraft): Promise<Stylist>;
  createIndependent(draft: StylistDraft): Promise<Stylist>;
  update(stylistId: string, draft: StylistDraft): Promise<Stylist>;
  delete(stylistId: string): Promise<void>;
  requestAffiliation(stylistId: string, businessId: string): Promise<Stylist>;
  acceptAffiliation(businessId: string, stylistId: string): Promise<Stylist>;
}
