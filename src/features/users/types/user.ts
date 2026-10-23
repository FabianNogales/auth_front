export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: 'Activo' | 'Inactivo' | string;
}