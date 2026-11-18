import { describe, expect, it } from 'vitest';
import { InvalidServiceError } from '../domain/errors/invalid-service-error';
import { aService, InMemoryServiceRepository } from '../testing/in-memory-service.repository';
import { CreateServiceUseCase } from './use-cases/create-service.use-case';
import { DeleteServiceUseCase } from './use-cases/delete-service.use-case';
import { GetBusinessServicesUseCase } from './use-cases/get-business-services.use-case';
import { UpdateServiceUseCase } from './use-cases/update-service.use-case';

describe('GetBusinessServicesUseCase', () => {
  it('ordena del más barato al más caro', async () => {
    const repository = new InMemoryServiceRepository([
      aService({ id: '1', name: 'Tinte', price: 120000 }),
      aService({ id: '2', name: 'Corte', price: 35000 }),
      aService({ id: '3', name: 'Barba', price: 35000 }),
    ]);
    const services = await new GetBusinessServicesUseCase(repository).execute('b-1');
    expect(services.map((service) => service.name)).toEqual(['Barba', 'Corte', 'Tinte']);
  });
});

describe('CreateServiceUseCase', () => {
  it('crea el servicio en el negocio', async () => {
    const repository = new InMemoryServiceRepository();
    const service = await new CreateServiceUseCase(repository).execute({
      businessId: 'b-1',
      name: 'Manicure',
      price: '30000',
      durationMinutes: 60,
    });
    expect(service.price.amount).toBe(30000);
    expect(await repository.findByBusiness('b-1')).toHaveLength(1);
  });

  it('no crea un servicio inválido', async () => {
    const repository = new InMemoryServiceRepository();
    await expect(
      new CreateServiceUseCase(repository).execute({ businessId: 'b-1', name: 'x', price: -5, durationMinutes: 60 }),
    ).rejects.toThrow(InvalidServiceError);
    expect(await repository.findByBusiness('b-1')).toHaveLength(0);
  });
});

describe('UpdateServiceUseCase', () => {
  it('actualiza los datos del servicio', async () => {
    const repository = new InMemoryServiceRepository([aService()]);
    const service = await new UpdateServiceUseCase(repository).execute({
      businessId: 'b-1',
      serviceId: 's-1',
      name: 'Corte premium',
      price: 50000,
      durationMinutes: 60,
    });
    expect(service.name).toBe('Corte premium');
  });
});

describe('DeleteServiceUseCase', () => {
  it('elimina el servicio y rechaza ids vacíos', async () => {
    const repository = new InMemoryServiceRepository([aService()]);
    const useCase = new DeleteServiceUseCase(repository);
    await useCase.execute({ businessId: 'b-1', serviceId: 's-1' });
    expect(repository.deleted).toEqual(['s-1']);
    await expect(useCase.execute({ businessId: 'b-1', serviceId: ' ' })).rejects.toThrow(InvalidServiceError);
  });
});
