import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, getProfile } from "@/api/auth";
import { UserType } from "@/types";
import { LoginResponse } from "@/types/api-responses";
import axios from 'axios';
import { domain } from '@/constants';

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: UserType | null;
  isSubuser: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loginSubuser: (email: string, password: string) => Promise<any>;
  logout: () => void;
  setUser: (user: UserType) => void;
  getUserProfile: (token: string) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isSubuser: false,
      login: async (email: string, password: string) => {
        const response = await login(email, password);
        if (response.status === 200) {
          // Fetch user profile after successful login
          const profile = await getProfile(response.access_token);
          if (profile) {
            set({
              isAuthenticated: true,
              token: response.access_token,
              user: profile as unknown as UserType,
              isSubuser: false,
            });
          }
        }
        return response;
      },
      loginSubuser: async (email: string, password: string) => {
        const response = await axios.post(`${domain}/api/subuser-login`, { email, password });
        if (response.data.status === 200) {
          set({
            isAuthenticated: true,
            token: response.data.access_token,
            isSubuser: true,
            user: {
              id: response.data.user_id,
              email: response.data.email,
              first_name: response.data.name.split(" ")[0],
              last_name: response.data.name.split(" ")[1] || '',
              role: response.data.role,
              subuser_id: response.data.subuser_id,
              user_id: response.data.user_id,
              wallet_balance: response.data.wallet_balance,
              feature_permission: response.data.feature_permission,
              sub_users: response.data.event_permission
            } as unknown as UserType
          });
        }
        return response.data;
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          isSubuser: false,
        });
      },
      setUser: (user: UserType) => {
        set({ user });
      },
      getUserProfile: async (token: string) => {
        const response = await getProfile(token);
        if (response) {
          set({ user: response as unknown as UserType });
        }
        return response;
      }
    }),
    {
      name: "klout-organiser-storage",
    }
  )
);

export default useAuthStore;