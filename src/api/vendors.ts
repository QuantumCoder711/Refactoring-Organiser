import { domain, token } from "@/constants";
import axios from "axios";

// Audience Acquisition
export const getAcquisitionVendors = async () => {
    try {
        const response = await axios.post(`${domain}/api/get-audience-acquisition`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch vendor companies");
        }
        throw new Error("An unexpected error occurred");
    }
}

// Gifting
export const getGiftingVendors = async () => {
    try {
        const response = await axios.post(`${domain}/api/get-gifting-partner`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch vendor companies");
        }
        throw new Error("An unexpected error occurred");
    }
}

// Event Setup
export const getEventSetupVendors = async () => {
    try {
        const response = await axios.post(`${domain}/api/get-event-setup`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch vendor companies");
        }
        throw new Error("An unexpected error occurred");
    }
}