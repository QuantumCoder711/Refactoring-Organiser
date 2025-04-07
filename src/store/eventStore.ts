import { getAllEvents } from "@/api/events";
import { create } from "zustand";
import { EventType } from "@/types";

interface EventStore {
    events: EventType[];
    setEvents: (events: EventType[]) => void;
    getAllEvents: (token: string) => Promise<void>;
}

const useEventStore = create<EventStore>((set) => ({
    events: [],
    setEvents: (events: EventType[]) => set({ events }),
    getAllEvents: async (token: string) => { 
        const response = await getAllEvents(token);
        set({ events: response.data });
    }
}));

export default useEventStore;
