import type { BusinessFilters, BusinessRepository } from '../application/repositories/business-repository';
import { Business, type BusinessInput } from '../domain/entities/business';
import { BusinessNotFoundError } from '../domain/errors/business-not-found-error';
import type { BusinessDraft } from '../domain/value-objects/business-draft';
import type { BusinessSchedule } from '../domain/value-objects/business-schedule';

export function aBusiness(overrides: Partial<BusinessInput> = {}): Business {
  return Business.create({
    id: 'b-1',
    name: 'Barbería Ícono',
    description: 'Cortes clásicos',
    address: 'Cra 100 # 11-60',
    latitude: 3.45,
    longitude: -76.53,
    status: 'ACTIVO',
    services: [
      { id: 's-2', name: 'Barba', price: '25000.00', durationMinutes: 30 },
      { id: 's-1', name: 'Corte clásico', price: 40000, durationMinutes: 45 },
    ],
    stylistCount: 1,
    ...overrides,
  });
}

export class InMemoryBusinessRepository implements BusinessRepository {
  lastFilters: BusinessFilters | null = null;
  created: BusinessDraft[] = [];
  updated: { id: string; draft: BusinessDraft }[] = [];
  schedules: { id: string; schedule: BusinessSchedule }[] = [];

  constructor(
    private readonly publicBusinesses: Business[] = [],
    private readonly ownBusinesses: Business[] = [],
  ) {}

  async findAll(filters: BusinessFilters): Promise<Business[]> {
    this.lastFilters = filters;
    return this.publicBusinesses;
  }

  async findById(id: string): Promise<Business> {
    const business = this.publicBusinesses.find((item) => item.id === id);
    if (!business) throw new BusinessNotFoundError(id);
    return business;
  }

  async findMine(): Promise<Business[]> {
    return this.ownBusinesses;
  }

  async create(draft: BusinessDraft): Promise<Business> {
    this.created.push(draft);
    return aBusiness({ id: `b-${this.created.length + 100}`, name: draft.name, status: 'EN_CONFIGURACION' });
  }

  async update(id: string, draft: BusinessDraft): Promise<Business> {
    this.updated.push({ id, draft });
    return aBusiness({ id, name: draft.name });
  }

  async saveSchedule(id: string, schedule: BusinessSchedule): Promise<void> {
    this.schedules.push({ id, schedule });
  }
}
