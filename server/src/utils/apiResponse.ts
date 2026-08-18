export interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

export interface ApiError {
  success: false;
  data: null;
  error: {
    message: string;
    code?: string;
    issues?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data, error: null };
}

export function failure(
  message: string,
  options: { code?: string; issues?: unknown } = {},
): ApiError {
  return {
    success: false,
    data: null,
    error: {
      message,
      code: options.code,
      issues: options.issues,
    },
  };
}