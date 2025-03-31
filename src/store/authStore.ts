import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, LoginResponse } from "@/api/auth";

interface AuthStore {
  isAuthenticated: boolean;
  kloutOrganiserToken: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      kloutOrganiserToken: null,
      login: async (email: string, password: string) => {
        const response = await login(email, password);
        if (response.status === 200) {
          set({ 
            isAuthenticated: true,
            kloutOrganiserToken: response.token 
          });
        }
        return response;
      },
      logout: () => {
        set({ 
          isAuthenticated: false,
          kloutOrganiserToken: null 
        });
      }
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
