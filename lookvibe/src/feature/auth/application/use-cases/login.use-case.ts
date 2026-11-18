import { AuthRepository, Credentials } from '../repositories/auth-repository';
import { SessionRepository } from '../repositories/sesion-repository';
import { Session } from '../../domain/entities/session';
//Logica del caso de uso de inicio de sesion
export class LoginUseCase {
  constructor(
    //aplica inyeccion de dependencias, recibiendo los repos de andentro 
    //hacia afuera para no depender de las implementaciones concretas y 
    //validar al arquitectura limpia
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository
  ) {}
  //Llama al repositorio de autenticación para validar 
  // las credenciales contra el backend remoto y, 
  // si es exitoso, inmediatamente llama al
  //  repositorio de sesión para guardar el token 
  // y los datos localmente.
  async execute(credentials: Credentials): Promise<Session> {
    const session = await this.authRepository.login(credentials);
    this.sessionRepository.save(session);
    return session;
  }
}