import { httpClient } from '../../../shared/services/httpClient.ts';
import { toApiError } from '../../../shared/services/ApiError.ts';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export const userService = {
  async register(input: RegisterUserInput) {
    try {
      const response = await httpClient.post('/users', input);
      return response.data;
    } catch (error) {
      throw toApiError(error, 'No se pudo registrar el usuario.');
    }
  }
};