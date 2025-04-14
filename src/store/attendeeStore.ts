import { getAllEventsAttendees, getSingleEventAttendees } from "@/api/attendees";
import { AttendeeType } from "@/types";
import { create } from "zustand";

interface AttendeeStore {
    allEventsAttendees: AttendeeType[];
    getAllEventsAttendees: (token: string) => Promise<void>;
    singleEventAttendees: AttendeeType[];
    getSingleEventAttendees: (token: string, uuid: string) => Promise<void>;
}

const useAttendeeStore = create<AttendeeStore>((set) => ({
    // All Events Attendees
    allEventsAttendees: [],
    getAllEventsAttendees: async (token: string) => {
        const response = await getAllEventsAttendees(token);
        set({ allEventsAttendees: response.total_attendees });
    },
    // Single Event Attendees
    singleEventAttendees: [],
    getSingleEventAttendees: async (token: string, uuid: string) => {
        const response = await getSingleEventAttendees(token, uuid);
        set({ singleEventAttendees: response.data });
    }
}));

export default useAttendeeStore;