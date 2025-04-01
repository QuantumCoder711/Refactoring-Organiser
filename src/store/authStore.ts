import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, getProfile } from "@/api/auth";
import { UserType } from "@/types";
import { LoginResponse } from "@/types/api-responses";

interface AuthStore {
  isAuthenticated: boolean;
  kloutOrganiserToken: string | null;
  user: UserType | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      kloutOrganiserToken: null,
      user: null,
      login: async (email: string, password: string) => {
        const response = await login(email, password);
        if (response.status === 200) {
          // Fetch user profile after successful login
          const profileResponse = await getProfile(response.access_token);
          if (profileResponse.status === 200) {
            set({ 
              isAuthenticated: true,
              kloutOrganiserToken: response.access_token,
              user: profileResponse.user
            });
          }
        }
        return response;
      },
      logout: () => {
        set({ 
          isAuthenticated: false,
          kloutOrganiserToken: null,
          user: null
        });
      }
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
