import { AuthRepository, RegisterData } from '../repositories/auth-repository';
import { SessionRepository } from '../repositories/sesion-repository';
import { Session } from '../../domain/entities/session';

export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(data: RegisterData): Promise<Session> {
    const session = await this.authRepository.register(data);
    this.sessionRepository.save(session);
    return session;
  }
}