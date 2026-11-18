import { sharedContainer } from '../../../shared/di/shared.container';
import { createHttpClient } from '../../../shared/infrastructure/http-client';
import { DescribeLocationUseCase } from '../application/use-cases/describe-location.use-case';
import { SearchAddressUseCase } from '../application/use-cases/search-address.use-case';
import { NominatimGeocodingService } from '../infraestructure/repositories/nominatim-geocoding.service';
import { CreateBusinessUseCase } from '../application/use-cases/create-business.use-case';
import { GetBusinessUseCase } from '../application/use-cases/get-business.use-case';
import { GetCurrentLocationUseCase } from '../application/use-cases/get-current-location.use-case';
import { GetMyBusinessUseCase } from '../application/use-cases/get-my-business.use-case';
import { GetMyBusinessesUseCase } from '../application/use-cases/get-my-businesses.use-case';
import { SaveBusinessScheduleUseCase } from '../application/use-cases/save-business-schedule.use-case';
import { SearchBusinessesUseCase } from '../application/use-cases/search-businesses.use-case';
import { UpdateBusinessUseCase } from '../application/use-cases/update-business.use-case';
import { BrowserLocationProvider } from '../infraestructure/repositories/browser-location.provider';
import { HttpBusinessRepository } from '../infraestructure/repositories/http-business.repository';

const businessRepository = new HttpBusinessRepository(sharedContainer.http);
const locationProvider = new BrowserLocationProvider();
const geocodingService = new NominatimGeocodingService(
  createHttpClient({ baseUrl: 'https://nominatim.openstreetmap.org', getToken: () => null }),
);

export const businessesContainer = {
  searchBusinesses: new SearchBusinessesUseCase(businessRepository),
  getBusiness: new GetBusinessUseCase(businessRepository),
  getMyBusinesses: new GetMyBusinessesUseCase(businessRepository),
  getMyBusiness: new GetMyBusinessUseCase(businessRepository),
  createBusiness: new CreateBusinessUseCase(businessRepository),
  updateBusiness: new UpdateBusinessUseCase(businessRepository),
  saveBusinessSchedule: new SaveBusinessScheduleUseCase(businessRepository),
  getCurrentLocation: new GetCurrentLocationUseCase(locationProvider),
  searchAddress: new SearchAddressUseCase(geocodingService),
  describeLocation: new DescribeLocationUseCase(geocodingService),
};
