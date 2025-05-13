import { domain, token } from "@/constants";
import axios from "axios";
import { EventResponse } from "@/types/api-responses";
import { AddEventType } from "@/types";

// Fetching All Events List
export const getAllEvents = async (token: string): Promise<EventResponse> => {
    try {
        const response = await axios.post(`${domain}/api/eventslist`, {}, {
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

// Deleting Event
export const deleteEvent = async (id: number) => {
    try {
        const response = await axios.delete(`${domain}/api/events/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to delete event");
        }
        throw new Error("An unexpected error occurred");
    }
}


// Adding Event
export const addEvent = async (eventData: AddEventType) => {
    try {
        const response = await axios.post(`${domain}/api/events`, eventData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to add event");
        }
        throw new Error("An unexpected error occurred");
    }
}