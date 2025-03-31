import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  kloutOrganiserToken: string | null;
  setKloutOrganiserToken: (kloutOrganiserToken: string | null) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      kloutOrganiserToken: null,
      setKloutOrganiserToken: (kloutOrganiserToken) => set({ kloutOrganiserToken }),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
    }
  )
);

export default useAuthStore;
