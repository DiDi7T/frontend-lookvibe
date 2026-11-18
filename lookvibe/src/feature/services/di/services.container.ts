import { sharedContainer } from '../../../shared/di/shared.container';
import { CreateServiceUseCase } from '../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../application/use-cases/delete-service.use-case';
import { GetBusinessServicesUseCase } from '../application/use-cases/get-business-services.use-case';
import { GetManagedServicesUseCase } from '../application/use-cases/get-managed-services.use-case';
import { UpdateServiceUseCase } from '../application/use-cases/update-service.use-case';
import { HttpServiceRepository } from '../infraestructure/repositories/http-service.repository';

const serviceRepository = new HttpServiceRepository(sharedContainer.http);

export const servicesContainer = {
  getBusinessServices: new GetBusinessServicesUseCase(serviceRepository),
  getManagedServices: new GetManagedServicesUseCase(serviceRepository),
  createService: new CreateServiceUseCase(serviceRepository),
  updateService: new UpdateServiceUseCase(serviceRepository),
  deleteService: new DeleteServiceUseCase(serviceRepository),
};
