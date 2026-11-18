import { describe, expect, it } from 'vitest';
import { InvalidStylistError } from '../domain/errors/invalid-stylist-error';
import { aStylist, InMemoryStylistRepository } from '../testing/in-memory-stylist.repository';
import { AffiliationError } from '../domain/errors/affiliation-error';
import { StylistNotFoundError } from '../domain/errors/stylist-not-found-error';
import { StylistProfileExistsError } from '../domain/errors/stylist-profile-exists-error';
import type { StylistProfileRegistry } from './repositories/stylist-profile-registry';
import { CreateIndependentStylistUseCase } from './use-cases/create-independent-stylist.use-case';
import { GetMyStylistProfileIdUseCase } from './use-cases/get-my-stylist-profile-id.use-case';
import { AcceptAffiliationUseCase } from './use-cases/accept-affiliation.use-case';
import { CreateStylistUseCase } from './use-cases/create-stylist.use-case';
import { RequestAffiliationUseCase } from './use-cases/request-affiliation.use-case';
import { GetStylistUseCase } from './use-cases/get-stylist.use-case';
import { DeleteStylistUseCase } from './use-cases/delete-stylist.use-case';
import { GetBusinessStylistsUseCase } from './use-cases/get-business-stylists.use-case';
import { UpdateStylistUseCase } from './use-cases/update-stylist.use-case';

describe('GetBusinessStylistsUseCase', () => {
  it('ordena el equipo por nombre', async () => {
    const repository = new InMemoryStylistRepository({
      'b-1': [aStylist({ id: '1', name: 'Valentina' }), aStylist({ id: '2', name: 'Andrés' })],
    });
    const stylists = await new GetBusinessStylistsUseCase(repository).execute('b-1');
    expect(stylists.map((stylist) => stylist.displayName)).toEqual(['Andrés', 'Valentina']);
  });
});

describe('CreateStylistUseCase', () => {
  it('agrega el estilista al negocio', async () => {
    const repository = new InMemoryStylistRepository();
    await new CreateStylistUseCase(repository).execute({ businessId: 'b-1', specialty: 'Barbero', photoUrl: '' });
    expect(await repository.findByBusiness('b-1')).toHaveLength(1);
  });

  it('no envía datos inválidos', async () => {
    const repository = new InMemoryStylistRepository();
    await expect(
      new CreateStylistUseCase(repository).execute({ businessId: 'b-1', specialty: '', photoUrl: '' }),
    ).rejects.toThrow(InvalidStylistError);
    expect(await repository.findByBusiness('b-1')).toHaveLength(0);
  });
});

describe('UpdateStylistUseCase', () => {
  it('actualiza la especialidad', async () => {
    const stylist = await new UpdateStylistUseCase(new InMemoryStylistRepository()).execute({
      stylistId: 'e-1',
      specialty: 'Estilista senior',
      photoUrl: '',
    });
    expect(stylist.specialty).toBe('Estilista senior');
  });
});

describe('GetStylistUseCase', () => {
  it('devuelve el perfil o falla si no existe', async () => {
    const repository = new InMemoryStylistRepository({ 'b-1': [aStylist({ id: 'e-7', business: { id: 'b-1', name: 'Zen Spa' } })] });
    const useCase = new GetStylistUseCase(repository);
    const stylist = await useCase.execute('e-7');
    expect(stylist.business?.name).toBe('Zen Spa');
    expect(stylist.isIndependent).toBe(false);
    await expect(useCase.execute('nadie')).rejects.toThrow(StylistNotFoundError);
  });
});

class InMemoryStylistProfileRegistry implements StylistProfileRegistry {
  private readonly profiles = new Map<string, string>();

  findProfileId(userId: string): string | null {
    return this.profiles.get(userId) ?? null;
  }

  rememberProfileId(userId: string, stylistId: string): void {
    this.profiles.set(userId, stylistId);
  }
}

describe('CreateIndependentStylistUseCase', () => {
  it('crea un perfil sin negocio, lo recuerda para el usuario y no permite un segundo perfil', async () => {
    const registry = new InMemoryStylistProfileRegistry();
    const useCase = new CreateIndependentStylistUseCase(new InMemoryStylistRepository(), registry);
    const stylist = await useCase.execute({ userId: 'u-1', specialty: 'Maquilladora', photoUrl: '' });
    expect(stylist.isIndependent).toBe(true);
    expect(new GetMyStylistProfileIdUseCase(registry).execute('u-1')).toBe(stylist.id);
    await expect(useCase.execute({ userId: 'u-1', specialty: 'Maquilladora', photoUrl: '' })).rejects.toThrow(StylistProfileExistsError);
  });

  it('valida antes de llamar al servidor y no recuerda nada', async () => {
    const registry = new InMemoryStylistProfileRegistry();
    await expect(
      new CreateIndependentStylistUseCase(new InMemoryStylistRepository(), registry).execute({ userId: 'u-1', specialty: '', photoUrl: '' }),
    ).rejects.toThrow(InvalidStylistError);
    expect(new GetMyStylistProfileIdUseCase(registry).execute('u-1')).toBeNull();
  });
});

describe('GetMyStylistProfileIdUseCase', () => {
  it('no busca perfil sin usuario', () => {
    expect(new GetMyStylistProfileIdUseCase(new InMemoryStylistProfileRegistry()).execute('  ')).toBeNull();
  });
});

describe('DeleteStylistUseCase', () => {
  it('retira al estilista y rechaza ids vacíos', async () => {
    const repository = new InMemoryStylistRepository();
    const useCase = new DeleteStylistUseCase(repository);
    await useCase.execute('e-1');
    expect(repository.deleted).toEqual(['e-1']);
    await expect(useCase.execute('')).rejects.toThrow(InvalidStylistError);
  });
});

describe('Afiliación con códigos', () => {
  const BUSINESS_CODE = '20000000-0000-4000-8000-000000000001';
  const STYLIST_CODE = '30000000-0000-4000-8000-000000000009';

  function setup(overrides: Parameters<typeof aStylist>[0] = {}) {
    const repository = new InMemoryStylistRepository({
      independientes: [aStylist({ id: STYLIST_CODE, accountId: 'u-1', affiliation: 'INDEPENDIENTE', business: null, ...overrides })],
    });
    return {
      repository,
      requestAffiliation: new RequestAffiliationUseCase(repository),
      acceptAffiliation: new AcceptAffiliationUseCase(repository),
    };
  }

  it('el estilista pide unirse con el código y el negocio lo acepta con el código del estilista', async () => {
    const { requestAffiliation, acceptAffiliation } = setup();

    const pending = await requestAffiliation.execute({ stylistId: STYLIST_CODE, businessCode: ` ${BUSINESS_CODE} ` });
    expect(pending.hasPendingRequest).toBe(true);

    const affiliated = await acceptAffiliation.execute({ businessId: BUSINESS_CODE, stylistCode: STYLIST_CODE });
    expect(affiliated.business?.id).toBe(BUSINESS_CODE);
    expect(affiliated.affiliation.value).toBe('AFILIADO');
  });

  it('rechaza códigos mal copiados sin llamar al servidor', async () => {
    const { repository, requestAffiliation, acceptAffiliation } = setup();
    await expect(requestAffiliation.execute({ stylistId: STYLIST_CODE, businessCode: '2000-abc' })).rejects.toThrow(InvalidStylistError);
    await expect(acceptAffiliation.execute({ businessId: BUSINESS_CODE, stylistCode: '' })).rejects.toThrow(InvalidStylistError);
    expect(repository.requests).toHaveLength(0);
  });

  it('el negocio no puede aceptar a quien no pidió unirse', async () => {
    const { acceptAffiliation } = setup();
    await expect(acceptAffiliation.execute({ businessId: BUSINESS_CODE, stylistCode: STYLIST_CODE })).rejects.toThrow(AffiliationError);
  });

  it('solo un estilista con cuenta y sin negocio puede pedir unirse', async () => {
    const withBusiness = setup({ business: { id: 'b-otro', name: 'Zen Spa' } });
    await expect(
      withBusiness.requestAffiliation.execute({ stylistId: STYLIST_CODE, businessCode: BUSINESS_CODE }),
    ).rejects.toThrow('Ya perteneces a Zen Spa.');

    const manual = setup({ accountId: null });
    await expect(manual.requestAffiliation.execute({ stylistId: STYLIST_CODE, businessCode: BUSINESS_CODE })).rejects.toThrow(AffiliationError);
  });
});
