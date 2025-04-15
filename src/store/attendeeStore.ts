import { getAllEventsAttendees, getSingleEventAttendees } from "@/api/attendees";
import { AttendeeType } from "@/types";
import { create } from "zustand";

interface AttendeeStore {
    allEventsAttendees: AttendeeType[];
    getAllEventsAttendees: (token: string) => Promise<void>;
    singleEventAttendees: AttendeeType[];
    getSingleEventAttendees: (token: string, uuid: string) => Promise<void>;
    loading: boolean;
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
    }
}));

export default useAttendeeStore;