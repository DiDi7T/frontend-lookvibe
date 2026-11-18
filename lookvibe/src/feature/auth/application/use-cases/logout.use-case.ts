import { AuthRepository } from '../repositories/auth-repository';
import { SessionRepository } from '../repositories/sesion-repository';

export class LogoutUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(): Promise<void> {
    const token = this.sessionRepository.getAccessToken();
    if (token) {
      try {
        await this.authRepository.logout(token);
      } catch {
        // Aunque falle la petición al servidor, limpiamos la sesión localmente
      }
    }
    this.sessionRepository.clear();
  }
}
