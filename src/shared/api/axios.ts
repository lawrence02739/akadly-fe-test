import axios from "axios";
import { store } from "../../store";
import { logout, setAuth } from "../../store/authSlice";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshRequest: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as
      { _retry?: boolean; url?: string } | undefined;
    const canRefresh =
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !request.url?.includes("/auth/refresh") &&
      !request.url?.includes("/auth/login");

    if (canRefresh) {
      request._retry = true;
      try {
        refreshRequest ??= api
          .post("/auth/refresh")
          .then((response) => {
            const user = response.data?.data?.user || response.data?.user;
            if (user) store.dispatch(setAuth({ user }));
          })
          .finally(() => {
            refreshRequest = null;
          });
        await refreshRequest;
        return api.request(request);
      } catch {
        store.dispatch(logout());
      }
    }

    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
