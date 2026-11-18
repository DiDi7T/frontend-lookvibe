import { InvalidBusinessError } from '../errors/invalid-business-error';

export class BusinessPage<T> {
  private constructor(
    readonly items: readonly T[],
    readonly page: number,
    readonly pageSize: number,
    readonly total: number,
  ) {}

  static paginate<T>(items: readonly T[], page: number, pageSize: number): BusinessPage<T> {
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new InvalidBusinessError('El tamaño de página debe ser un entero positivo.');
    }
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Number.isInteger(page) ? Math.min(Math.max(page, 1), totalPages) : 1;
    const start = (safePage - 1) * pageSize;
    return new BusinessPage(items.slice(start, start + pageSize), safePage, pageSize, items.length);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get hasPrevious(): boolean {
    return this.page > 1;
  }

  get hasNext(): boolean {
    return this.page < this.totalPages;
  }
}
