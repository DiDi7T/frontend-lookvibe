import { HttpAuthRepository } from '../infraestructure/repositories/http-auth-repository';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { sharedContainer } from '../../../shared/di/shared.container';
import { sessionRepository } from './session.container';

const authRepository = new HttpAuthRepository(sharedContainer.http);

const loginUseCase = new LoginUseCase(authRepository, sessionRepository);
const registerUseCase = new RegisterUseCase(authRepository, sessionRepository);
const logoutUseCase = new LogoutUseCase(authRepository, sessionRepository);

export const authContainer = {
  sessionRepository,
  authRepository,
  loginUseCase,
  registerUseCase,
  logoutUseCase,
};
