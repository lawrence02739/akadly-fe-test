import axios from 'axios';
import { API_BASE_URL } from '../../../shared/api/config';

export const studentApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// On 401, clear local student session and redirect to login
studentApi.interceptors.response.use(
  (res) => res,
  (error: { response?: { status?: number }; config?: { url?: string } }) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login')
    ) {
      localStorage.removeItem('student_user');
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  },
);

