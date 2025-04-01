import { domain } from "@/constants";
import axios from "axios";
import { LoginResponse, ProfileResponse } from "@/types/api-responses";

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

export const getProfile = async (token: string): Promise<ProfileResponse> => {
    try {
        const response = await axios.post(`${domain}/api/profile`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data.user;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch profile");
        }
        throw new Error("An unexpected error occurred");
    }
}