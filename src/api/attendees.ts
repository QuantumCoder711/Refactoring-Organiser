import { domain } from "@/constants";
import axios from "axios";
import { AllEventsAttendeesResponse } from "@/types/api-responses";

// All Attendees List of All Events
export const getAllEventsAttendees = async (token: string): Promise<AllEventsAttendeesResponse> => {
    try {
        const response = await axios.post(`${domain}/api/totalattendeesOrganizer`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch attendees");
        }
        throw new Error("An unexpected error occurred");
    }
}