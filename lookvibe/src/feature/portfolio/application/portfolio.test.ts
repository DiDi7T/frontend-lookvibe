import { describe, expect, it } from 'vitest';
import { PortfolioItem } from '../domain/entities/portfolio-item';
import { InvalidPortfolioError } from '../domain/errors/invalid-portfolio-error';
import type { PortfolioDraft } from '../domain/value-objects/portfolio-draft';
import { PortfolioDraft as Draft } from '../domain/value-objects/portfolio-draft';
import type { PortfolioOwner } from '../domain/value-objects/portfolio-owner';
import type { PortfolioRepository } from './repositories/portfolio-repository';
import { AddPortfolioPhotoUseCase } from './use-cases/add-portfolio-photo.use-case';
import { GetPortfolioUseCase } from './use-cases/get-portfolio.use-case';

class InMemoryPortfolioRepository implements PortfolioRepository {
  added: { owner: PortfolioOwner; draft: PortfolioDraft }[] = [];

  constructor(private readonly items: PortfolioItem[] = []) {}

  async findByOwner(): Promise<PortfolioItem[]> {
    return this.items;
  }

  async add(owner: PortfolioOwner, draft: PortfolioDraft): Promise<PortfolioItem> {
    this.added.push({ owner, draft });
    return PortfolioItem.create({ id: 'p-new', photoUrl: draft.photoUrl.value, description: draft.description, createdAt: '2026-11-17T10:00:00Z' });
  }
}

const photo = (id: string, createdAt: string) =>
  PortfolioItem.create({ id, photoUrl: `https://fotos.co/${id}.jpg`, description: null, createdAt });

describe('PortfolioItem y PortfolioDraft', () => {
  it('solo aceptan URLs http o https', () => {
    expect(() => photo('a', '2026-11-01T10:00:00Z')).not.toThrow();
    expect(() => PortfolioItem.create({ id: 'x', photoUrl: 'ftp://foto.png', description: null, createdAt: '2026-11-01' })).toThrow(InvalidPortfolioError);
    expect(() => Draft.create({ photoUrl: 'no es url', description: '' })).toThrow(InvalidPortfolioError);
  });

  it('limita la descripción y la deja en null si está vacía', () => {
    expect(Draft.create({ photoUrl: 'https://fotos.co/a.jpg', description: '  ' }).description).toBeNull();
    expect(() => Draft.create({ photoUrl: 'https://fotos.co/a.jpg', description: 'x'.repeat(256) })).toThrow(InvalidPortfolioError);
  });
});

describe('GetPortfolioUseCase', () => {
  it('muestra primero las fotos más recientes', async () => {
    const repository = new InMemoryPortfolioRepository([photo('vieja', '2026-10-01T10:00:00Z'), photo('nueva', '2026-11-10T10:00:00Z')]);
    const items = await new GetPortfolioUseCase(repository).execute('stylist', 'e-1');
    expect(items.map((item) => item.id)).toEqual(['nueva', 'vieja']);
  });

  it('exige un dueño', async () => {
    await expect(new GetPortfolioUseCase(new InMemoryPortfolioRepository()).execute('business', ' ')).rejects.toThrow(InvalidPortfolioError);
  });
});

describe('AddPortfolioPhotoUseCase', () => {
  it('agrega la foto al dueño indicado', async () => {
    const repository = new InMemoryPortfolioRepository();
    await new AddPortfolioPhotoUseCase(repository).execute({
      ownerKind: 'business',
      ownerId: 'b-1',
      photoUrl: 'https://fotos.co/local.jpg',
      description: 'Nuestro local',
    });
    expect(repository.added[0].owner.kind).toBe('business');
    expect(repository.added[0].draft.description).toBe('Nuestro local');
  });

  it('no llama al repositorio con una URL inválida', async () => {
    const repository = new InMemoryPortfolioRepository();
    await expect(
      new AddPortfolioPhotoUseCase(repository).execute({ ownerKind: 'stylist', ownerId: 'e-1', photoUrl: 'foto.jpg', description: '' }),
    ).rejects.toThrow(InvalidPortfolioError);
    expect(repository.added).toHaveLength(0);
  });
});
