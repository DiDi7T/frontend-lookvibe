'use client';

import Link from 'next/link';

interface DashboardNavbarProps {
  userName?: string;
  userEmail?: string;
  isAuthenticated: boolean;
  canBook: boolean;
  canManageBusinesses: boolean;
  canViewReports: boolean;
  isStylist: boolean;
  onLogout: () => void;
}

export function DashboardNavbar({ userName, userEmail, isAuthenticated, canBook, canManageBusinesses, canViewReports, isStylist, onLogout }: DashboardNavbarProps) {
  return (
    <header className="border-b border-gray-800 bg-[#131926] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold text-amber-500 tracking-wide">
          LookVibe
        </Link>
        <nav className="hidden md:flex space-x-4 text-sm text-gray-300">
          {isAuthenticated && <Link href="/dashboard" className="hover:text-amber-400 transition">Panel</Link>}
          <Link href="/businesses" className="hover:text-amber-400 transition">Negocios</Link>
          {canManageBusinesses && <Link href="/businesses/manage" className="hover:text-amber-400 transition">Mi negocio</Link>}
          {canViewReports && <Link href="/reports" className="hover:text-amber-400 transition">Reportes</Link>}
          {isStylist && <Link href="/stylists/me" className="hover:text-amber-400 transition">Mi perfil de estilista</Link>}
          {isAuthenticated && <Link href="/appointments" className="hover:text-amber-400 transition">Citas</Link>}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? <>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{userName || 'Usuario'}</p>
            <p className="text-xs text-gray-400">{userEmail}</p>
          </div>
          {canBook && <Link href="/appointments/new" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">Reservar</Link>}
          <button type="button" onClick={onLogout} className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-lg transition">Cerrar sesión</button>
        </> : <>
          <Link href="/login" className="text-sm text-gray-200 hover:text-amber-400">Iniciar sesión</Link>
          <Link href="/register" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">Crear cuenta</Link>
        </>}
      </div>
    </header>
  );
}
