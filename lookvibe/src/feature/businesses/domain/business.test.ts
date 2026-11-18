import { describe, expect, it } from 'vitest';
import { aBusiness } from '../testing/in-memory-business.repository';
import { InvalidBusinessError } from './errors/invalid-business-error';
import { BusinessDraft } from './value-objects/business-draft';
import { BusinessLocation } from './value-objects/business-location';
import { SearchRadius } from './value-objects/search-radius';
import { BusinessPage } from './value-objects/business-page';
import { BusinessSchedule } from './value-objects/business-schedule';

describe('Business', () => {
  it('no permite un negocio sin nombre ni con un estado desconocido', () => {
    expect(() => aBusiness({ name: '  ' })).toThrow(InvalidBusinessError);
    expect(() => aBusiness({ status: 'CERRADO' })).toThrow(InvalidBusinessError);
  });

  it('exige latitud y longitud juntas y dentro de rango', () => {
    expect(() => aBusiness({ latitude: 3.4, longitude: null })).toThrow(InvalidBusinessError);
    expect(() => aBusiness({ latitude: 95, longitude: 10 })).toThrow(InvalidBusinessError);
    expect(aBusiness({ latitude: null, longitude: null }).location).toBeNull();
  });

  it('solo recibe citas si está activo y tiene servicios', () => {
    expect(aBusiness().isBookable).toBe(true);
    expect(aBusiness({ status: 'EN_CONFIGURACION' }).isBookable).toBe(false);
    expect(aBusiness({ services: [] }).isBookable).toBe(false);
  });

  it('indica qué le falta para activarse', () => {
    const business = aBusiness({ latitude: null, longitude: null, services: [], stylistCount: 0 });
    expect(business.missingSetup).toEqual(['ubicación', 'servicios', 'estilistas']);
  });

  it('ordena sus servicios por precio y expone el precio desde', () => {
    const business = aBusiness();
    expect(business.services.map((service) => service.name)).toEqual(['Barba', 'Corte clásico']);
    expect(business.startingPrice).toBe(25000);
    expect(business.hasServiceUpTo(30000)).toBe(true);
    expect(business.hasServiceUpTo(20000)).toBe(false);
  });

  it('no acepta servicios con precio o duración inválidos', () => {
    expect(() => aBusiness({ services: [{ id: 's', name: 'Corte', price: 'gratis', durationMinutes: 30 }] })).toThrow(InvalidBusinessError);
    expect(() => aBusiness({ services: [{ id: 's', name: 'Corte', price: 100, durationMinutes: 0 }] })).toThrow(InvalidBusinessError);
  });

  it('calcula la distancia a un punto', () => {
    const business = aBusiness({ latitude: 4.6584, longitude: -74.058 });
    const nearby = BusinessLocation.create(4.6584, -74.068);
    expect(business.distanceKmFrom(nearby)).toBeCloseTo(1.11, 1);
    expect(aBusiness({ latitude: null, longitude: null }).distanceKmFrom(nearby)).toBeNull();
  });

  it('busca por nombre, dirección o descripción sin distinguir mayúsculas', () => {
    const business = aBusiness();
    expect(business.matches('ícono')).toBe(true);
    expect(business.matches('CRA 100')).toBe(true);
    expect(business.matches('spa')).toBe(false);
  });
});

describe('BusinessDraft', () => {
  it('limpia los textos y deja en null los opcionales vacíos', () => {
    const draft = BusinessDraft.create({ name: '  Zen Spa ', description: ' ', address: '', latitude: null, longitude: null });
    expect(draft.name).toBe('Zen Spa');
    expect(draft.description).toBeNull();
    expect(draft.address).toBeNull();
  });

  it('rechaza un nombre demasiado largo', () => {
    expect(() =>
      BusinessDraft.create({ name: 'x'.repeat(121), description: '', address: '', latitude: null, longitude: null }),
    ).toThrow(InvalidBusinessError);
  });
});

describe('BusinessSchedule', () => {
  it('acepta franjas válidas', () => {
    const schedule = BusinessSchedule.create([{ dayOfWeek: 1, startTime: '08:00', endTime: '12:00' }]);
    expect(schedule.timeZone).toBe('America/Bogota');
  });

  it('rechaza horarios vacíos, al revés o cruzados', () => {
    expect(() => BusinessSchedule.create([])).toThrow(InvalidBusinessError);
    expect(() => BusinessSchedule.create([{ dayOfWeek: 1, startTime: '18:00', endTime: '08:00' }])).toThrow(InvalidBusinessError);
    expect(() =>
      BusinessSchedule.create([
        { dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '11:00', endTime: '14:00' },
      ]),
    ).toThrow(InvalidBusinessError);
    expect(() => BusinessSchedule.create([{ dayOfWeek: 7, startTime: '08:00', endTime: '12:00' }])).toThrow(InvalidBusinessError);
  });
});

describe('SearchRadius', () => {
  it('solo acepta radios entre 0 y 50 km', () => {
    expect(SearchRadius.create(5).kilometers).toBe(5);
    expect(() => SearchRadius.create(0)).toThrow(InvalidBusinessError);
    expect(() => SearchRadius.create(80)).toThrow(InvalidBusinessError);
  });
});

describe('BusinessPage', () => {
  it('pagina y corrige páginas fuera de rango', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const page = BusinessPage.paginate(items, 2, 3);
    expect(page.items).toEqual([4, 5, 6]);
    expect(page.totalPages).toBe(3);
    expect(page.hasPrevious && page.hasNext).toBe(true);
    expect(BusinessPage.paginate(items, 99, 3).page).toBe(3);
    expect(BusinessPage.paginate([], 1, 3).totalPages).toBe(1);
  });
});
