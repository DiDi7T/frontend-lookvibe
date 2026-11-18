import { describe, expect, it } from 'vitest';
import { BusinessNotFoundError } from '../domain/errors/business-not-found-error';
import { InvalidBusinessError } from '../domain/errors/invalid-business-error';
import { aBusiness, InMemoryBusinessRepository } from '../testing/in-memory-business.repository';
import { CreateBusinessUseCase } from './use-cases/create-business.use-case';
import { GetMyBusinessUseCase } from './use-cases/get-my-business.use-case';
import { SaveBusinessScheduleUseCase } from './use-cases/save-business-schedule.use-case';
import { SearchBusinessesUseCase } from './use-cases/search-businesses.use-case';
import { UpdateBusinessUseCase } from './use-cases/update-business.use-case';

const draft = { name: 'Zen Spa', description: '', address: '', latitude: null, longitude: null };

describe('SearchBusinessesUseCase', () => {
  const repository = new InMemoryBusinessRepository([
    aBusiness({ id: '1', name: 'Zen Spa' }),
    aBusiness({ id: '2', name: 'Barbería Ícono' }),
    aBusiness({ id: '3', name: 'Alma Nails', address: 'Granada' }),
  ]);

  it('ordena por nombre y pagina', async () => {
    const page = await new SearchBusinessesUseCase(repository).execute({ page: 1, pageSize: 2 });
    expect(page.items.map((item) => item.business.name)).toEqual(['Alma Nails', 'Barbería Ícono']);
    expect(page.totalPages).toBe(2);
  });

  it('filtra por texto y manda el servicio al repositorio', async () => {
    const page = await new SearchBusinessesUseCase(repository).execute({ query: 'granada', service: ' Uñas ' });
    expect(page.items.map((item) => item.business.id)).toEqual(['3']);
    expect(repository.lastFilters).toEqual({ service: 'Uñas', near: undefined });
  });

  it('busca cerca de un punto y ordena del más cercano al más lejano', async () => {
    const nearRepository = new InMemoryBusinessRepository([
      aBusiness({ id: 'lejos', name: 'A lejos', latitude: 4.70, longitude: -74.05 }),
      aBusiness({ id: 'cerca', name: 'Z cerca', latitude: 4.6584, longitude: -74.058 }),
    ]);
    const page = await new SearchBusinessesUseCase(nearRepository).execute({
      near: { latitude: 4.6584, longitude: -74.06, radiusKm: 5 },
    });
    expect(page.items.map((item) => item.business.id)).toEqual(['cerca', 'lejos']);
    expect(page.items[0].distanceKm).toBeLessThan(1);
    expect(nearRepository.lastFilters?.near?.radius.kilometers).toBe(5);
  });

  it('filtra por precio máximo y valida el filtro', async () => {
    const useCase = new SearchBusinessesUseCase(new InMemoryBusinessRepository([
      aBusiness({ id: 'barato' }),
      aBusiness({ id: 'caro', services: [{ id: 's', name: 'Tinte', price: 200000, durationMinutes: 120 }] }),
    ]));
    const page = await useCase.execute({ maxPrice: 50000 });
    expect(page.items.map((item) => item.business.id)).toEqual(['barato']);
    await expect(useCase.execute({ maxPrice: 0 })).rejects.toThrow(InvalidBusinessError);
    await expect(useCase.execute({ near: { latitude: 4.6, longitude: -74, radiusKm: 0 } })).rejects.toThrow(InvalidBusinessError);
  });
});

describe('CreateBusinessUseCase', () => {
  it('valida antes de llamar al repositorio', async () => {
    const repository = new InMemoryBusinessRepository();
    await expect(new CreateBusinessUseCase(repository).execute({ ...draft, name: '' })).rejects.toThrow(InvalidBusinessError);
    expect(repository.created).toHaveLength(0);
  });

  it('crea el negocio con los datos limpios', async () => {
    const repository = new InMemoryBusinessRepository();
    const business = await new CreateBusinessUseCase(repository).execute({ ...draft, name: '  Zen Spa  ' });
    expect(repository.created[0].name).toBe('Zen Spa');
    expect(business.status.isActive).toBe(false);
  });
});

describe('UpdateBusinessUseCase', () => {
  it('actualiza el negocio indicado', async () => {
    const repository = new InMemoryBusinessRepository();
    await new UpdateBusinessUseCase(repository).execute({ ...draft, id: ' b-9 ' });
    expect(repository.updated[0].id).toBe('b-9');
  });
});

describe('GetMyBusinessUseCase', () => {
  it('solo devuelve negocios propios', async () => {
    const repository = new InMemoryBusinessRepository([], [aBusiness({ id: 'mio' })]);
    const useCase = new GetMyBusinessUseCase(repository);
    expect((await useCase.execute('mio')).id).toBe('mio');
    await expect(useCase.execute('ajeno')).rejects.toThrow(BusinessNotFoundError);
  });
});

describe('SaveBusinessScheduleUseCase', () => {
  it('no envía un horario inválido', async () => {
    const repository = new InMemoryBusinessRepository();
    await expect(
      new SaveBusinessScheduleUseCase(repository).execute({ businessId: 'b-1', intervals: [] }),
    ).rejects.toThrow(InvalidBusinessError);
    expect(repository.schedules).toHaveLength(0);
  });

  it('guarda el horario validado', async () => {
    const repository = new InMemoryBusinessRepository();
    await new SaveBusinessScheduleUseCase(repository).execute({
      businessId: 'b-1',
      intervals: [{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }],
    });
    expect(repository.schedules[0].schedule.intervals).toHaveLength(1);
  });
});
