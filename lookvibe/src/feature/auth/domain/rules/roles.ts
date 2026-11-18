import { Session } from '../entities/session';
import { AppRole } from '../value-objects/app-role';
//: Una regla de negocio que 
//Recibe la sesión actual y un rol requerido, 
//y devuelve true o false evaluando 
//si el arreglo roles incluye ese rol (Escalable para si seguimos con este proyecto).
export function hasRole(session: Session | null, requiredRole: AppRole): boolean {
  if (!session) return false;
  return session.roles.includes(requiredRole);
}