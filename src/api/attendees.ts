import { domain } from "@/constants";
import axios from "axios";
import { AllEventsAttendeesResponse, SingleEventAttendeesResponse, DeleteAttendeeResponse, CustomCheckInResponse, BulkDeleteAttendeesResponse } from "@/types/api-responses";

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


// Single Event Attendees
export const getSingleEventAttendees = async (token: string, uuid: string): Promise<SingleEventAttendeesResponse> => {
    try {
        const response = await axios.post(`${domain}/api/totalattendees/${uuid}`, {}, {
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


// Delete Attendee
export const deleteAttendee = async (token: string, id: number): Promise<DeleteAttendeeResponse> => {
    try {
        const response = await axios.delete(`${domain}/api/attendees/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to delete attendee");
        }
        throw new Error("An unexpected error occurred");
    }
}


// Custom Check In
export const customCheckIn = async (token: string, uuid: string, event_id: number, user_id: number): Promise<CustomCheckInResponse> => {
    try {
        const response = await axios.post(`${domain}/api/manual-check-in`, {
            attendee_uuid: uuid,
            event_id,
            user_id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to custom check in");
        }
        throw new Error("An unexpected error occurred");
    }
}


// Bulk Delete Attendees
export const bulkDeleteAttendees = async (token: string, ids: number[]): Promise<BulkDeleteAttendeesResponse> => {
    try {
        const response = await axios.post(`${domain}/api/delete-multiple-attendees`, {ids},{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to bulk delete attendees");
        }
        throw new Error("An unexpected error occurred");
    }
}


