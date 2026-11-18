import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authContainer } from '../../di/auth.container';

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authContainer.loginUseCase.execute({ email, password });
      
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Credenciales inválidas o error en el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
