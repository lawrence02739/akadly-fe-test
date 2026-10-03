import axios from 'axios';

const STUDENT_API_BASE =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const studentApi = axios.create({
  baseURL: STUDENT_API_BASE,
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
