import { sessionRepository } from '../../feature/auth/di/session.container';
import { createHttpClient } from '../infrastructure/http-client';

export const sharedContainer = {
  http: createHttpClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    getToken: () => sessionRepository.getAccessToken(),
  }),
};
