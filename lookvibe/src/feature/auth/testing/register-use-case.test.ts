import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { InMemoryAuthRepository } from './in-memory-auth-repository';

type RegisterSecondDependency = ConstructorParameters<typeof RegisterUseCase>[1];
type SavedSessionType = Parameters<RegisterSecondDependency['save']>[0];

describe('RegisterUseCase (Pruebas Unitarias - Clean Architecture)', () => {
  let repository: InMemoryAuthRepository;
  let secondDependency: RegisterSecondDependency;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    
    // Tipado estricto sin 'any'
    secondDependency = {
      save: (session: SavedSessionType): void => {
        // Lógica simulada del almacenamiento en memoria
      },
    } as unknown as RegisterSecondDependency;

    registerUseCase = new RegisterUseCase(repository, secondDependency);
  });

  it('debe registrar exitosamente a un usuario con rol de estilista usando el repositorio falso', async () => {
    const newUserData = {
      nombre: 'Carla Estilista',
      email: 'carla.estilista@example.com',
      password: 'password123',
      role: 'estilista' as const,
    };

    const session = await registerUseCase.execute(newUserData);

    expect(session).toBeDefined();
    expect(session.email).toBe('carla.estilista@example.com');
    expect(session.roles).toContain('estilista');
    expect(repository.registeredUsers).toHaveLength(1);
  });

  it('debe lanzar un error si el repositorio falso simula una falla', async () => {
    repository.failRegisterWith = new Error('Error de conexión con el servidor');

    await expect(
      registerUseCase.execute({
        nombre: 'Prueba Fallida',
        email: 'fail@example.com',
        password: 'password123',
        role: 'cliente',
      })
    ).rejects.toThrow('Error de conexión con el servidor');
  });
});