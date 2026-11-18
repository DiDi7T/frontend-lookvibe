import { HttpError, type HttpClient } from '../../../../shared/infrastructure/http-client';
import type { StylistRepository } from '../../application/repositories/stylist-repository';
import type { Stylist } from '../../domain/entities/stylist';
import { AffiliationError } from '../../domain/errors/affiliation-error';
import { StylistNotFoundError } from '../../domain/errors/stylist-not-found-error';
import { StylistProfileExistsError } from '../../domain/errors/stylist-profile-exists-error';
import type { StylistDraft } from '../../domain/value-objects/stylist-draft';
import type { StylistDto } from '../dtos/stylist.dto';
import { stylistDraftToDto, stylistToDomain } from '../mappers/stylist.mapper';

export class HttpStylistRepository implements StylistRepository {
  constructor(private readonly http: HttpClient) {}

  async findByBusiness(businessId: string): Promise<Stylist[]> {
    const stylists = await this.http.get<StylistDto[]>(this.businessPath(businessId));
    return stylists.map(stylistToDomain);
  }

  async findManaged(businessId: string): Promise<Stylist[]> {
    const stylists = await this.http.get<StylistDto[]>(`${this.businessPath(businessId)}/gestion`);
    return stylists.map(stylistToDomain);
  }

  async findById(stylistId: string): Promise<Stylist> {
    try {
      return stylistToDomain(await this.http.get<StylistDto>(`/estilistas/${encodeURIComponent(stylistId)}`));
    } catch (reason: unknown) {
      if (reason instanceof HttpError && (reason.status === 404 || reason.status === 400)) {
        throw new StylistNotFoundError(stylistId);
      }
      throw reason;
    }
  }

  async createForBusiness(businessId: string, draft: StylistDraft): Promise<Stylist> {
    return stylistToDomain(
      await this.http.post<StylistDto>(this.businessPath(businessId), stylistDraftToDto(draft)),
    );
  }

  async createIndependent(draft: StylistDraft): Promise<Stylist> {
    try {
      return stylistToDomain(await this.http.post<StylistDto>('/estilistas', stylistDraftToDto(draft)));
    } catch (reason: unknown) {
      if (reason instanceof HttpError && reason.status === 409) throw new StylistProfileExistsError();
      throw reason;
    }
  }

  async update(stylistId: string, draft: StylistDraft): Promise<Stylist> {
    return stylistToDomain(
      await this.http.patch<StylistDto>(`/estilistas/${encodeURIComponent(stylistId)}`, stylistDraftToDto(draft)),
    );
  }

  async delete(stylistId: string): Promise<void> {
    await this.http.delete(`/estilistas/${encodeURIComponent(stylistId)}`);
  }

  async requestAffiliation(stylistId: string, businessId: string): Promise<Stylist> {
    try {
      return stylistToDomain(
        await this.http.post<StylistDto>(`/estilistas/${encodeURIComponent(stylistId)}/solicitar-afiliacion`, { businessId }),
      );
    } catch (reason: unknown) {
      if (reason instanceof HttpError && (reason.status === 404 || reason.status === 400)) {
        throw new AffiliationError('No encontramos un negocio con ese código de invitación.');
      }
      if (reason instanceof HttpError && reason.status === 403) {
        throw new AffiliationError('Solo el dueño de este perfil puede pedir unirse a un negocio.');
      }
      throw reason;
    }
  }

  async acceptAffiliation(businessId: string, stylistId: string): Promise<Stylist> {
    try {
      return stylistToDomain(
        await this.http.put<StylistDto>(
          `${this.businessPath(businessId)}/${encodeURIComponent(stylistId)}/afiliar`,
          {},
        ),
      );
    } catch (reason: unknown) {
      if (reason instanceof HttpError && reason.status === 409) {
        throw new AffiliationError(
          'Ese estilista no ha pedido unirse a tu negocio. Pídele que use tu código de invitación primero.',
        );
      }
      if (reason instanceof HttpError && (reason.status === 404 || reason.status === 400)) {
        throw new AffiliationError('No encontramos un estilista con ese código.');
      }
      throw reason;
    }
  }

  private businessPath(businessId: string): string {
    return `/negocios/${encodeURIComponent(businessId)}/estilistas`;
  }
}
