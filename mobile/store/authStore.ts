import { create } from "zustand";
import * as storage from "@/lib/storage";
import { fetchMeRequest, type AuthUserData } from "@/lib/api";

interface AuthState {
  user: AuthUserData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (payload: {
    user: AuthUserData;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async ({ user, accessToken, refreshToken }) => {
    await storage.setTokens(accessToken, refreshToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setAccessToken: (token) => {
    void storage.setAccessToken(token);
    set({ accessToken: token });
  },

  logout: async () => {
    await storage.clearTokens();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrate: async () => {
    try {
      const token = await storage.getAccessToken();

      if (!token) {
        set({ isLoading: false });
        return;
      }

      set({ accessToken: token, isAuthenticated: true });
      const user = await fetchMeRequest();
      set({ user, isLoading: false });
    } catch {
      await storage.clearTokens();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export const selectAccessToken = (s: AuthState) => s.accessToken;