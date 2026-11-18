import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { InMemoryAuthRepository } from './in-memory-auth-repository';

type LoginSecondDependency = ConstructorParameters<typeof LoginUseCase>[1];
type SavedSessionType = Parameters<LoginSecondDependency['save']>[0];

describe('LoginUseCase (Pruebas Unitarias - Clean Architecture)', () => {
  let repository: InMemoryAuthRepository;
  let secondDependency: LoginSecondDependency;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    
    // Tipado estricto sin 'any' usando el tipo extraído de la sesión guardada
    secondDependency = {
      save: (session: SavedSessionType): void => {
        // Lógica simulada del almacenamiento en memoria
      },
    } as unknown as LoginSecondDependency;

    loginUseCase = new LoginUseCase(repository, secondDependency);
  });

  it('debe iniciar sesión exitosamente con credenciales válidas usando el repositorio falso', async () => {
    const mockUser = {
      nombre: 'Ana Cliente',
      email: 'ana.cliente@example.com',
      password: 'password123',
      role: 'cliente' as const,
    };
    await repository.register(mockUser);

    const session = await loginUseCase.execute({
      email: 'ana.cliente@example.com',
      password: 'password123',
    });

    expect(session).toBeDefined();
    expect(session.email).toBe('ana.cliente@example.com');
    expect(session.token).toBe('mock-jwt-token');
  });

  it('debe lanzar un error si el usuario no existe o las credenciales son incorrectas', async () => {
    await expect(
      loginUseCase.execute({
        email: 'no.existe@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow();
  });
});