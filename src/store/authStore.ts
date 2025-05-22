import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, getProfile } from "@/api/auth";
import { UserType } from "@/types";
import { LoginResponse } from "@/types/api-responses";

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: UserType | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  setUser: (user: UserType) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: async (email: string, password: string) => {
        const response = await login(email, password);
        if (response.status === 200) {
          // Fetch user profile after successful login
          const profile = await getProfile(response.access_token);
          if (profile) {
            set({ 
              isAuthenticated: true,
              token: response.access_token,
              user: profile as unknown as UserType
            });
          }
        }
        return response;
      },
      logout: () => {
        set({ 
          isAuthenticated: false,
          token: null,
          user: null
        });
      },
      setUser: (user: UserType) => {
        set({ user });
      }
    }),
    {
      name: "klout-organiser-storage",
    }
  )
);

export default useAuthStore;
