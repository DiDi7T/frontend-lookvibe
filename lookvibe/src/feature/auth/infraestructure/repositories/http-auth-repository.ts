import { AuthRepository, Credentials, RegisterData } from '../../application/repositories/auth-repository';
import { Session } from '../../domain/entities/session';
import { AuthResponseDto } from '../dtos/login-response.dto';
import { HttpClient } from '../../../../shared/infrastructure/http-client';
//Toco cambiar esta basura para que me leyera el role con el formularo
//para que el back lo entendiera
export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: Credentials): Promise<Session> {
    const response = await this.httpClient.post<AuthResponseDto>('/auth/login', credentials);
    
    return {
      userId: response.user_id || response.id || '',
      email: response.email,
      nombre: response.nombre || '',
      roles: response.roles,
      token: response.token,
    };
  }

  async register(data: RegisterData): Promise<Session> {
    
    const payload = {
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      roles: [data.role || 'client'],
    };
    //Tener en cuenta para la tarea de graph

    const response = await this.httpClient.post<AuthResponseDto>('/auth/register', payload);

    return {
      userId: response.user_id || response.id || '',
      email: response.email,
      nombre: response.nombre || data.nombre,
      roles: response.roles,
      token: response.token,
    };
  }

  async logout(token: string): Promise<void> {
    await this.httpClient.post('/auth/logout', { token });
  }
}