'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '../hooks/use-register';

export function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'cliente' | 'estilista' | 'negocio'>('cliente');
  const { register, loading, error } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(nombre, email, password, role);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Crear Cuenta</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Regístrate en LookVibe para comenzar</p>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-400 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="register-name" className="block text-xs font-medium text-slate-300 mb-1">Nombre completo</label>
            <input 
              id="register-name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
            <input 
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="tucorreo@email.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
            <input 
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="register-role" className="block text-xs font-medium text-slate-300 mb-1">Tipo de cuenta</label>
            <select 
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'cliente' | 'estilista' | 'negocio')}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="cliente">Cliente</option>
              <option value="estilista">Estilista</option>
              <option value="negocio">Negocio</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition mt-2 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-amber-400 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
