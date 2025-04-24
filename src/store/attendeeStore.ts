import { addAttendee, bulkDeleteAttendees, customCheckIn, deleteAttendee, getAllEventsAttendees, getSingleEventAttendees } from "@/api/attendees";
import { AttendeeType } from "@/types";
import { AddAttendeeResponse, BulkDeleteAttendeesResponse, CustomCheckInResponse, DeleteAttendeeResponse } from "@/types/api-responses";
import { create } from "zustand";

interface AttendeeStore {
    allEventsAttendees: AttendeeType[];
    getAllEventsAttendees: (token: string) => Promise<void>;
    singleEventAttendees: AttendeeType[];
    getSingleEventAttendees: (token: string, uuid: string) => Promise<void>;
    loading: boolean;
    deleteAttendee: (id: number, token: string) => Promise<DeleteAttendeeResponse>;
    customCheckIn: (uuid: string, event_id: number, user_id: number, token: string) => Promise<CustomCheckInResponse>;
    bulkDeleteAttendees: (token: string, ids: number[]) => Promise<BulkDeleteAttendeesResponse>;
    addAttendee: (token: string, uuid: string, attendeeData: FormData) => Promise<AddAttendeeResponse>;
}

const useAttendeeStore = create<AttendeeStore>((set) => ({
    // All Events Attendees
    allEventsAttendees: [],
    loading: false,
    getAllEventsAttendees: async (token: string) => {
        try {
            set({ loading: true });
            const response = await getAllEventsAttendees(token);
            set({ allEventsAttendees: response.total_attendees });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Single Event Attendees
    singleEventAttendees: [],
    getSingleEventAttendees: async (token: string, uuid: string) => {
        try {
            set({ loading: true });
            const response = await getSingleEventAttendees(token, uuid);
            set({ singleEventAttendees: response.data });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Delete Attendee
    deleteAttendee: async (id: number, token: string) => {
        try {
            set({ loading: true });
            const response = await deleteAttendee(token, id);
            if (response.status === 200) {
                set((state) => ({
                    singleEventAttendees: state.singleEventAttendees.filter(attendee => attendee.id !== id),
                    loading: false
                }));
            } else {
                set({ loading: false });
                throw new Error(response.message);
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Custom Check In
    customCheckIn: async (uuid: string, event_id: number, user_id: number, token: string) => {
        try {
            set({ loading: true });
            const response = await customCheckIn(token, uuid, event_id, user_id);
            if (response.status === 200) {
                set((state) => ({
                    singleEventAttendees: state.singleEventAttendees.map(attendee =>
                        attendee.uuid === uuid ? { ...attendee, check_in: 1 } : attendee
                    )
                }));
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Bulk Delete Attendees
    bulkDeleteAttendees: async (token: string, ids: number[]) => {
        try {
            set({ loading: true });
            const response = await bulkDeleteAttendees(token, ids);
            if (response.status === 200) {
                set((state) => ({
                    singleEventAttendees: state.singleEventAttendees.filter(attendee => !ids.includes(attendee.id))
                }));
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    // Add Attendee
    addAttendee: async (token: string, uuid: string, attendeeData: FormData) => {
        try {
            set({ loading: true });
            const response = await addAttendee(token, attendeeData);
            if (response.status === 200) {
                // Refresh the attendees list for this event
                await getSingleEventAttendees(token, uuid)
                    .then(eventAttendeesResponse => {
                        set({ singleEventAttendees: eventAttendeesResponse.data });
                    });
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));

export default useAttendeeStore;