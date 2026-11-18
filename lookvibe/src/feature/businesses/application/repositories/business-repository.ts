import type { Business } from '../../domain/entities/business';
import type { BusinessDraft } from '../../domain/value-objects/business-draft';
import type { BusinessLocation } from '../../domain/value-objects/business-location';
import type { BusinessSchedule } from '../../domain/value-objects/business-schedule';
import type { SearchRadius } from '../../domain/value-objects/search-radius';

export interface BusinessFilters {
  service?: string;
  near?: { location: BusinessLocation; radius: SearchRadius };
}

export interface BusinessRepository {
  findAll(filters: BusinessFilters): Promise<Business[]>;
  findById(id: string): Promise<Business>;
  findMine(): Promise<Business[]>;
  create(draft: BusinessDraft): Promise<Business>;
  update(id: string, draft: BusinessDraft): Promise<Business>;
  saveSchedule(id: string, schedule: BusinessSchedule): Promise<void>;
}
