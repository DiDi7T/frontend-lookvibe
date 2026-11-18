'use client';

import Link from 'next/link';
import { useState } from 'react';

interface DashboardNavbarProps {
  userName?: string;
  userEmail?: string;
  isAuthenticated: boolean;
  canBook: boolean;
  canBrowseBusinesses: boolean;
  canManageBusinesses: boolean;
  canViewReports: boolean;
  canModerateReviews: boolean;
  canViewAppointments: boolean;
  isStylist: boolean;
  onLogout: () => void;
}

export function DashboardNavbar({
  userName,
  userEmail,
  isAuthenticated,
  canBook,
  canBrowseBusinesses,
  canManageBusinesses,
  canViewReports,
  canModerateReviews,
  canViewAppointments,
  isStylist,
  onLogout,
}: DashboardNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="border-b border-gray-800 bg-[#131926] sticky top-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-amber-500 tracking-wide">
            LookVibe
          </Link>

          <nav className="hidden md:flex space-x-4 text-sm text-gray-300">
            {isAuthenticated && <Link href="/dashboard" className="hover:text-amber-400 transition">Panel</Link>}
            {canBrowseBusinesses && <Link href="/businesses" className="hover:text-amber-400 transition">Negocios</Link>}
            {canManageBusinesses && <Link href="/businesses/manage" className="hover:text-amber-400 transition">Mi negocio</Link>}
            {canViewReports && <Link href="/reports" className="hover:text-amber-400 transition">Reportes</Link>}
            {canModerateReviews && <Link href="/reviews/moderation" className="hover:text-amber-400 transition">Moderar reseñas</Link>}
            {isStylist && <Link href="/stylists/me" className="hover:text-amber-400 transition">Mi perfil de estilista</Link>}
            {canViewAppointments && <Link href="/appointments" className="hover:text-amber-400 transition">Citas</Link>}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{userName || 'Usuario'}</p>
                <p className="text-xs text-gray-400">{userEmail}</p>
              </div>
              {canBook && (
                <Link href="/appointments/new" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">
                  Reservar
                </Link>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-lg transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-200 hover:text-amber-400">Iniciar sesión</Link>
              <Link href="/register" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center space-x-3">
          {isAuthenticated && canBook && (
            <Link href="/appointments/new" className="text-xs bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded-lg">
              Reservar
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-white p-2 focus:outline-none"
            aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0d121c] border-t border-gray-800 px-6 py-4 space-y-4 shadow-xl">
          {isAuthenticated && (
            <div className="pb-3 border-b border-gray-800">
              <p className="text-sm font-medium text-white">{userName || 'Usuario'}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          )}

          <nav className="flex flex-col space-y-3 text-sm text-gray-300">
            {isAuthenticated && (
              <Link href="/dashboard" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Panel
              </Link>
            )}
            {canBrowseBusinesses && (
              <Link href="/businesses" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Negocios
              </Link>
            )}
            {canManageBusinesses && (
              <Link href="/businesses/manage" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Mi negocio
              </Link>
            )}
            {canViewReports && (
              <Link href="/reports" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Reportes
              </Link>
            )}
            {canModerateReviews && (
              <Link href="/reviews/moderation" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Moderar reseñas
              </Link>
            )}
            {isStylist && (
              <Link href="/stylists/me" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Mi perfil de estilista
              </Link>
            )}
            {canViewAppointments && (
              <Link href="/appointments" onClick={closeMenu} className="hover:text-amber-400 transition py-1">
                Citas
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-800 flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => { closeMenu(); onLogout(); }}
                className="w-full text-center text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-lg transition"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu} className="text-center text-sm text-gray-200 hover:text-amber-400 py-1">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={closeMenu} className="text-center text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
