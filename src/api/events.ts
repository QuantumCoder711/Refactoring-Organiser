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
export const addEvent = async (eventData: AddEventType, token: string) => {
    try {
        // Create FormData to handle file uploads
        const formData = new FormData();

        // Add all fields to FormData
        Object.entries(eventData).forEach(([key, value]) => {
            // Skip null values except for image which can be null
            if (value !== null || key === 'image') {
                // Handle image file specially
                if (key === 'image' && value instanceof File) {
                    // Check file size before uploading
                    const fileSizeMB = value.size / 1024 / 1024;
                    console.log(`Uploading image: ${value.name}, size: ${fileSizeMB.toFixed(2)}MB`);

                    formData.append(key, value);
                } else if (key === 'image' && typeof value === 'string') {
                    // If image is a string (existing image URL), don't send it
                    console.log("Keeping existing image, not sending in request");
                } else if (key !== 'image' || value === null) {
                    // For non-image fields or when image is null
                    formData.append(key, String(value));
                }
            }
        });

        // Make sure event_end_date is set if not already
        if (!formData.has('event_end_date') && eventData.event_date) {
            formData.append('event_end_date', String(eventData.event_date));
        }

        // Log the form data for debugging
        console.log("FormData entries:");
        for (const pair of formData.entries()) {
            if (pair[0] === 'image' && pair[1] instanceof File) {
                console.log(pair[0], `File: ${(pair[1] as File).name}, size: ${((pair[1] as File).size / 1024 / 1024).toFixed(2)}MB`);
            } else {
                console.log(pair[0], pair[1]);
            }
        }

        const response = await axios.post(`${domain}/api/events`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
            // Add timeout to prevent hanging requests
            timeout: 60000, // 60 seconds
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Check for specific error codes
            if (error.response?.status === 413) {
                console.error("Request entity too large. File size may be too big.");
                throw new Error("File size is too large. Please use a smaller image (less than 2MB).");
            }
            // Pass through the entire error response for better error handling
            throw error;
        }
        throw new Error("An unexpected error occurred");
    }
}

// Updating Event
export const updateEvent = async (id: string, eventData: AddEventType, token: string) => {
    try {
        // Create FormData to handle file uploads
        const formData = new FormData();

        // Add all fields to FormData
        Object.entries(eventData).forEach(([key, value]) => {
            // Skip null values except for image which can be null
            if (value !== null || key === 'image') {
                // Handle image file specially
                if (key === 'image' && value instanceof File) {
                    // Check file size before uploading
                    const fileSizeMB = value.size / 1024 / 1024;
                    console.log(`Uploading image: ${value.name}, size: ${fileSizeMB.toFixed(2)}MB`);

                    formData.append(key, value);
                } else if (key === 'image' && typeof value === 'string') {
                    // If image is a string (existing image URL), don't send it
                    // This prevents the API from trying to process a string as a file
                    console.log("Keeping existing image, not sending in request");
                } else if (key !== 'image' || value === null) {
                    // For non-image fields or when image is null
                    formData.append(key, String(value));
                }
            }
        });

        // Add method_field for Laravel to handle PUT request
        formData.append('_method', 'PUT');

        // Make sure event_end_date is set if not already
        if (!formData.has('event_end_date') && eventData.event_date) {
            formData.append('event_end_date', String(eventData.event_date));
        }

        // Log the form data for debugging
        console.log("FormData entries:");
        for (const pair of formData.entries()) {
            if (pair[0] === 'image' && pair[1] instanceof File) {
                console.log(pair[0], `File: ${(pair[1] as File).name}, size: ${((pair[1] as File).size / 1024 / 1024).toFixed(2)}MB`);
            } else {
                console.log(pair[0], pair[1]);
            }
        }

        const response = await axios.post(`${domain}/api/events/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
            // Add timeout to prevent hanging requests
            timeout: 60000, // 60 seconds
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Check for specific error codes
            if (error.response?.status === 413) {
                console.error("Request entity too large. File size may be too big.");
                throw new Error("File size is too large. Please use a smaller image (less than 2MB).");
            }
            // Pass through the entire error response for better error handling
            throw error;
        }
        throw new Error("An unexpected error occurred");
    }
}