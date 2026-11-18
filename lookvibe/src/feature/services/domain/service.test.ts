import { describe, expect, it } from 'vitest';
import { aService } from '../testing/in-memory-service.repository';
import { InvalidServiceError } from './errors/invalid-service-error';
import { ServiceDraft } from './value-objects/service-draft';
import { ServicePrice } from './value-objects/service-price';

describe('Service', () => {
  it('acepta el precio como texto, como lo manda Postgres', () => {
    expect(aService({ price: '45000.00' }).price.amount).toBe(45000);
  });

  it('no existe con precio o duración inválidos', () => {
    expect(() => aService({ price: 0 })).toThrow(InvalidServiceError);
    expect(() => aService({ price: 'gratis' })).toThrow(InvalidServiceError);
    expect(() => aService({ durationMinutes: 0 })).toThrow(InvalidServiceError);
    expect(() => aService({ durationMinutes: 12.5 })).toThrow(InvalidServiceError);
    expect(() => aService({ name: '' })).toThrow(InvalidServiceError);
  });
});

describe('ServicePrice', () => {
  it('admite máximo dos decimales', () => {
    expect(ServicePrice.create(10.1).amount).toBe(10.1);
    expect(() => ServicePrice.create(10.123)).toThrow(InvalidServiceError);
    expect(() => ServicePrice.create('')).toThrow(InvalidServiceError);
  });
});

describe('ServiceDraft', () => {
  it('limpia el nombre y rechaza duraciones de más de 8 horas', () => {
    expect(ServiceDraft.create({ name: ' Barba ', price: '20000', durationMinutes: 30 }).name).toBe('Barba');
    expect(() => ServiceDraft.create({ name: 'Barba', price: 20000, durationMinutes: 481 })).toThrow(InvalidServiceError);
  });
});
