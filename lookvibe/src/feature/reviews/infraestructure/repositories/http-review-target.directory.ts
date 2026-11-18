import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { ReviewTargetDirectory } from '../../application/repositories/review-target-directory';
import type { ReviewTargetRef } from '../../domain/value-objects/review-target-ref';
import type { ExploreResponseDto } from '../dtos/review.dto';

export class HttpReviewTargetDirectory implements ReviewTargetDirectory {
  constructor(private readonly http: HttpClient) {}

  async findAll(): Promise<ReviewTargetRef[]> {
    const response = await this.http.get<ExploreResponseDto>('/explorar');
    const businesses: ReviewTargetRef[] = (response.negocios ?? []).map((business) => ({
      kind: 'business',
      id: business.id,
      name: business.nombre?.trim() || 'Negocio',
    }));
    const stylists: ReviewTargetRef[] = (response.estilistas ?? []).map((stylist) => ({
      kind: 'stylist',
      id: stylist.id,
      name: stylist.usuario?.nombre?.trim() || stylist.especialidad?.trim() || 'Estilista',
    }));
    return [...businesses, ...stylists];
  }
}
