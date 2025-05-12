import { domain, token } from "@/constants";
import { DayTwoReminderType, SendReminderType, SendSameDayReminderType, SessionReminderType, VisitBoothReminderType } from "@/types";
import axios from "axios";

export const sendReminder = async (formData: SendReminderType) => {
    try {
        const response = await axios.post(`${domain}/api/notifications`, formData, {
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

export const sendSameDayReminder = async (formData: SendSameDayReminderType) => {
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

export const sessionReminder = async (formData: SessionReminderType) => {
    try {
        const response = await axios.post(`${domain}/api/session-reminder`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send session reminder");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const visitBoothReminder = async (formData: VisitBoothReminderType) => {
    try {
        const response = await axios.post(`${domain}/api/reminder-to-visit-booth`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send visit booth reminder");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const dayTwoReminder = async (formData: DayTwoReminderType) => {
    try {
        const response = await axios.post(`${domain}/api/day-two-reminder`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send day two reminder");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const dayTwoSameDayReminder = async (formData: DayTwoReminderType) => {
    try {
        const response = await axios.post(`${domain}/api/day_two_same_day_reminder`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to send day two same day reminder");
        }
        throw new Error("An unexpected error occurred");
    }
}