import { domain } from "@/constants";
import axios from "axios";
import { EventResponse } from "@/types/api-responses";

// Fetching All Events List
export const getAllEvents = async(token: string): Promise<EventResponse> => {
    try {
        const response = await axios.post(`${domain}/api/events`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch events");
        }
        throw new Error("An unexpected error occurred");
    }
}