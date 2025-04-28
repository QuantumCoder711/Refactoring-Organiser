import { domain, token } from "@/constants";
import { SendReminder, SendSameDayReminder } from "@/types";
import axios from "axios";

export const sendReminder = async (formData: SendReminder) => {
    try {
        const response = await axios.post(`${domain}/api/notifications/send-reminder`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send reminder");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const sendSameDayReminder = async (formData: SendSameDayReminder) => {
    try {
        const response = await axios.post(`${domain}/api/notifications-samedayinvitation`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send same day reminder");
        }
        throw new Error("An unexpected error occurred");
    }
};