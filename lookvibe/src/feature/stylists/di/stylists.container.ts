import { sharedContainer } from '../../../shared/di/shared.container';
import { AcceptAffiliationUseCase } from '../application/use-cases/accept-affiliation.use-case';
import { CreateIndependentStylistUseCase } from '../application/use-cases/create-independent-stylist.use-case';
import { RequestAffiliationUseCase } from '../application/use-cases/request-affiliation.use-case';
import { CreateStylistUseCase } from '../application/use-cases/create-stylist.use-case';
import { DeleteStylistUseCase } from '../application/use-cases/delete-stylist.use-case';
import { GetBusinessStylistsUseCase } from '../application/use-cases/get-business-stylists.use-case';
import { GetManagedStylistsUseCase } from '../application/use-cases/get-managed-stylists.use-case';
import { GetStylistUseCase } from '../application/use-cases/get-stylist.use-case';
import { UpdateStylistUseCase } from '../application/use-cases/update-stylist.use-case';
import { GetMyStylistProfileIdUseCase } from '../application/use-cases/get-my-stylist-profile-id.use-case';
import { HttpStylistRepository } from '../infraestructure/repositories/http-stylist.repository';
import { LocalStorageStylistProfileRegistry } from '../infraestructure/repositories/local-storage-stylist-profile.registry';

const stylistRepository = new HttpStylistRepository(sharedContainer.http);
const stylistProfileRegistry = new LocalStorageStylistProfileRegistry();

export const stylistsContainer = {
  getBusinessStylists: new GetBusinessStylistsUseCase(stylistRepository),
  getManagedStylists: new GetManagedStylistsUseCase(stylistRepository),
  getStylist: new GetStylistUseCase(stylistRepository),
  createStylist: new CreateStylistUseCase(stylistRepository),
  createIndependentStylist: new CreateIndependentStylistUseCase(stylistRepository, stylistProfileRegistry),
  getMyStylistProfileId: new GetMyStylistProfileIdUseCase(stylistProfileRegistry),
  requestAffiliation: new RequestAffiliationUseCase(stylistRepository),
  acceptAffiliation: new AcceptAffiliationUseCase(stylistRepository),
  updateStylist: new UpdateStylistUseCase(stylistRepository),
  deleteStylist: new DeleteStylistUseCase(stylistRepository),
};
