export type UserRole = 'cliente' | 'estilista' | 'admin';


export interface AuthResponseDto {
  user_id?: string;
  id?: string;
  email: string;
  nombre?: string;
  roles: UserRole[]; 
  token: string;
}
