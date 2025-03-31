import { domain } from "@/constants";
import axios from "axios";

export interface LoginResponse {
  status: number;
  message: string;
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post(`${domain}/api/login`, {
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
        throw new Error("An unexpected error occurred");
    }
}
