import { getAllEventsAttendees } from "@/api/attendees";
import { AttendeeType } from "@/types";
import { create } from "zustand";

interface AttendeeStore {
    allEventsAttendees: AttendeeType[];
    getAllEventsAttendees: (token: string) => Promise<void>;
}

const useAttendeeStore = create<AttendeeStore>((set) => ({
    allEventsAttendees: [],
    getAllEventsAttendees: async (token: string) => {
        const response = await getAllEventsAttendees(token);
        set({ allEventsAttendees: response.total_attendees });
    }
}));

export default useAttendeeStore;
