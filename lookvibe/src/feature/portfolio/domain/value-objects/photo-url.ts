import { InvalidPortfolioError } from '../errors/invalid-portfolio-error';

const MAX_LENGTH = 2048;

export class PhotoUrl {
  private constructor(readonly value: string) {}

  static create(value: string): PhotoUrl {
    const url = value.trim();
    if (!url) throw new InvalidPortfolioError('La foto necesita una URL.');
    if (url.length > MAX_LENGTH) throw new InvalidPortfolioError('La URL de la foto es demasiado larga.');
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new InvalidPortfolioError('La foto debe ser una URL válida, por ejemplo https://…/foto.jpg');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new InvalidPortfolioError('La foto debe ser una URL http o https.');
    }
    return new PhotoUrl(url);
  }
}
