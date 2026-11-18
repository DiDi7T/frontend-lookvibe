import { AppRole } from '../value-objects/app-role';
//Define el molde puro de cómo se ve una 
//sesión de usuario en el frontend
//(userId, email, nombre, roles, token), 
//adaptado exactamente a lo que emite tu backend.
export interface Session {
  userId: string;
  email: string;
  nombre: string;
  roles: AppRole[];
  token: string;
}