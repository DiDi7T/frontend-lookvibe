import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { ServiceRepository } from '../../application/repositories/service-repository';
import type { Service } from '../../domain/entities/service';
import type { ServiceDraft } from '../../domain/value-objects/service-draft';
import type { ServiceDto } from '../dtos/service.dto';
import { serviceDraftToDto, serviceToDomain } from '../mappers/service.mapper';

export class HttpServiceRepository implements ServiceRepository {
  constructor(private readonly http: HttpClient) {}

  async findByBusiness(businessId: string): Promise<Service[]> {
    const services = await this.http.get<ServiceDto[]>(this.basePath(businessId));
    return services.map((service) => serviceToDomain(service, businessId));
  }

  async findManaged(businessId: string): Promise<Service[]> {
    const services = await this.http.get<ServiceDto[]>(`${this.basePath(businessId)}/gestion`);
    return services.map((service) => serviceToDomain(service, businessId));
  }

  async create(businessId: string, draft: ServiceDraft): Promise<Service> {
    const service = await this.http.post<ServiceDto>(this.basePath(businessId), serviceDraftToDto(draft));
    return serviceToDomain(service, businessId);
  }

  async update(businessId: string, serviceId: string, draft: ServiceDraft): Promise<Service> {
    const service = await this.http.patch<ServiceDto>(
      `${this.basePath(businessId)}/${encodeURIComponent(serviceId)}`,
      serviceDraftToDto(draft),
    );
    return serviceToDomain(service, businessId);
  }

  async delete(businessId: string, serviceId: string): Promise<void> {
    await this.http.delete(`${this.basePath(businessId)}/${encodeURIComponent(serviceId)}`);
  }

  private basePath(businessId: string): string {
    return `/negocios/${encodeURIComponent(businessId)}/servicios`;
  }
}
