import axios, { type InternalAxiosRequestConfig } from "axios";

// Access token is kept in memory only.
export const tokenRef = { current: null as string | null };

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  const doRefresh = async () => {
    const { data } = await axiosInstance.post<{ accessToken: string }>(
      "/auth/refresh",
    );
    return data.accessToken;
  };
  // Serialize refreshes across tabs, which share one cookie jar.
  if (navigator.locks) {
    return navigator.locks.request("cozy-editor-auth-refresh", doRefresh);
  }
  return doRefresh();
}

export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= requestNewAccessToken()
    .then((token) => {
      tokenRef.current = token;
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

axiosInstance.interceptors.request.use((config) => {
  if (tokenRef.current) {
    config.headers.Authorization = `Bearer ${tokenRef.current}`;
  }
  return config;
});

const NO_RETRY_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const shouldTryRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_RETRY_PATHS.some((path) => originalRequest.url?.includes(path));

    if (!shouldTryRefresh) return Promise.reject(error);

    originalRequest._retry = true;
    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (
        axios.isAxiosError(refreshError) &&
        refreshError.response?.status === 401
      ) {
        tokenRef.current = null;
        onSessionExpired?.();
      }
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
