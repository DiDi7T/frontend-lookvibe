import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authContainer } from '../../di/auth.container';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (
    nombre: string,
    email: string,
    password: string,
    role: 'cliente' | 'estilista' | 'negocio' = 'cliente'
  ) => {
    setLoading(true);
    setError(null);
    try {
      await authContainer.registerUseCase.execute({ nombre, email, password, role });
      router.push(role === 'negocio' ? '/businesses/manage/new' : '/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar el usuario en el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}