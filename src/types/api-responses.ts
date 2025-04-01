import { UserType } from "./index";

export interface LoginResponse {
    status: number;
    message: string;
    email: string;
    access_token_type: string;
    access_token: string;
    user_id: number;
}

export interface ProfileResponse {
    access_token: string;
    message: string;
    status: number;
    user: UserType;
}

// Add more API response types here as needed 