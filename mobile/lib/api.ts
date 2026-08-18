import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import * as storage from "@/lib/storage";

export interface ApiErrorBody {
  success: false;
  data: null;
  error: {
    message: string;
    code?: string;
    issues?: Record<string, string[]>;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  error: null;
}

export type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUserData;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await storage.getRefreshToken();
  if (!refreshToken) return null;

  const response = await axios.post<ApiBody<AuthResponse>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 15_000 },
  );

  if (!response.data.success) return null;

  const { accessToken, refreshToken: nextRefresh } = response.data.data;
  await storage.setTokens(accessToken, nextRefresh);
  return accessToken;
}

let refreshPromise: Promise<string | null> | null = null;

async function handleAuthFailure(): Promise<void> {
  await useAuthStore.getState().logout();
  router.replace("/(auth)/login");
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint = original?.url?.includes("/auth/") ?? false;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true;

      refreshPromise =
        refreshPromise ??
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        });

      const newToken = await refreshPromise;

      if (newToken) {
        useAuthStore.getState().setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      await handleAuthFailure();
    }

    return Promise.reject(error);
  },
);

export function loginRequest(input: LoginInput): Promise<AuthResponse> {
  return api
    .post<ApiBody<AuthResponse>>("/auth/login", input)
    .then((res) => {
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    });
}

export function signupRequest(input: SignupInput): Promise<AuthResponse> {
  return api
    .post<ApiBody<AuthResponse>>("/auth/signup", input)
    .then((res) => {
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    });
}

export function fetchMeRequest(): Promise<AuthUserData> {
  return api
    .get<ApiBody<{ user: AuthUserData }>>("/auth/me")
    .then((res) => {
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data.user;
    });
}

export function isNetworkError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    !error.response &&
    error.code !== undefined
  );
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.error?.message ??
      "Something went wrong. Please try again."
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function getErrorIssues(
  error: unknown,
): Record<string, string[]> | undefined {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.issues;
  }
  return undefined;
}

export function getErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.code;
  }
  return undefined;
}

export { API_BASE_URL };