import type { Service } from '../../domain/entities/service';
import type { ServiceDraft } from '../../domain/value-objects/service-draft';

export interface ServiceRepository {
  findByBusiness(businessId: string): Promise<Service[]>;
  findManaged(businessId: string): Promise<Service[]>;
  create(businessId: string, draft: ServiceDraft): Promise<Service>;
  update(businessId: string, serviceId: string, draft: ServiceDraft): Promise<Service>;
  delete(businessId: string, serviceId: string): Promise<void>;
}
