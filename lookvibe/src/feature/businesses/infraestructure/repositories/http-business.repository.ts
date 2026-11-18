import { HttpError, type HttpClient } from '../../../../shared/infrastructure/http-client';
import type { BusinessFilters, BusinessRepository } from '../../application/repositories/business-repository';
import type { Business } from '../../domain/entities/business';
import { BusinessNotFoundError } from '../../domain/errors/business-not-found-error';
import type { BusinessDraft } from '../../domain/value-objects/business-draft';
import type { BusinessSchedule } from '../../domain/value-objects/business-schedule';
import type { BusinessDto } from '../dtos/business.dto';
import { businessToDomain, draftToDto, filtersToQuery, scheduleToDto } from '../mappers/business.mapper';

export class HttpBusinessRepository implements BusinessRepository {
  constructor(private readonly http: HttpClient) {}

  async findAll(filters: BusinessFilters): Promise<Business[]> {
    const businesses = await this.http.get<BusinessDto[]>(`/negocios${filtersToQuery(filters)}`);
    return businesses.map(businessToDomain);
  }

  async findById(id: string): Promise<Business> {
    try {
      return businessToDomain(await this.http.get<BusinessDto>(`/negocios/${encodeURIComponent(id)}`));
    } catch (reason: unknown) {
      if (reason instanceof HttpError && (reason.status === 404 || reason.status === 400)) {
        throw new BusinessNotFoundError(id);
      }
      throw reason;
    }
  }

  async findMine(): Promise<Business[]> {
    const businesses = await this.http.get<BusinessDto[]>('/negocios/mios');
    return businesses.map(businessToDomain);
  }

  async create(draft: BusinessDraft): Promise<Business> {
    return businessToDomain(await this.http.post<BusinessDto>('/negocios', draftToDto(draft)));
  }

  async update(id: string, draft: BusinessDraft): Promise<Business> {
    return businessToDomain(
      await this.http.patch<BusinessDto>(`/negocios/${encodeURIComponent(id)}`, draftToDto(draft)),
    );
  }

  async saveSchedule(id: string, schedule: BusinessSchedule): Promise<void> {
    await this.http.put(`/citas/negocios/${encodeURIComponent(id)}/horarios`, scheduleToDto(schedule));
  }
}
