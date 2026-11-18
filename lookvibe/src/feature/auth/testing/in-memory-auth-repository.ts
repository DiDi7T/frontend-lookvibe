import { AuthRepository, Credentials, RegisterData } from '../application/repositories/auth-repository';
import { Session } from '../domain/entities/session';
//Exporte del repositorye en cuetion para implementar el falso repo
export class InMemoryAuthRepository implements AuthRepository {
    //Datos de mokeo
  public registeredUsers: RegisterData[] = [];
  //manejor de errores
  public failRegisterWith?: Error;
    //Ahora hacemos el metodo loging para el assert del metodo

  async login(credentials: Credentials): Promise<Session> {
    const user = this.registeredUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    return {
      userId: 'mock-user-id-123',
      email: user.email,
      nombre: user.nombre,
      roles: [user.role || 'cliente'],
      token: 'mock-jwt-token',
    };
  }
  //registramos y manejamos los errores moqueados
  async register(data: RegisterData): Promise<Session> {
    if (this.failRegisterWith) {
      throw this.failRegisterWith;
    }
    
    if (this.registeredUsers.some(u => u.email === data.email)) {
      throw new Error('El correo ya está registrado');
    }

    this.registeredUsers.push(data);

    return {
      userId: `mock-id-${Date.now()}`,
      email: data.email,
      nombre: data.nombre,
      roles: [data.role || 'cliente'],
      token: 'mock-jwt-token',
    };
  }

  async logout(): Promise<void> {
    // como un cierre de la sesion pero ps ahi
  }
}