import { Session } from '../../domain/entities/session';

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  role?: 'cliente' | 'estilista' | 'negocio';
}

export interface AuthRepository {
  login(credentials: Credentials): Promise<Session>;
  register(data: RegisterData): Promise<Session>;
  logout(token: string): Promise<void>;
}