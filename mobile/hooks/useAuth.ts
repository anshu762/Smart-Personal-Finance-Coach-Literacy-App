import { useMutation } from "@tanstack/react-query";
import {
  loginRequest,
  signupRequest,
  type AuthResponse,
  type LoginInput,
  type SignupInput,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
  };
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: (data: AuthResponse) => {
      void setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

export function useSignup() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (input: SignupInput) => signupRequest(input),
    onSuccess: (data: AuthResponse) => {
      void setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}