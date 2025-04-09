import { getAllEvents } from "@/api/events";
import { create } from "zustand";
import { EventType } from "@/types";

interface EventStore {
    events: EventType[];
    setEvents: (events: EventType[]) => void;
    getAllEvents: (token: string) => Promise<void>;
    getEventById: (id: number) => EventType | null;
}

const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    setEvents: (events: EventType[]) => set({ events }),
    getAllEvents: async (token: string) => {
        const response = await getAllEvents(token);
        set({ events: response.data });
    },
    getEventById: (id: number) => {
        const { events } = get();
        return events.find(event => event.id === id) || null;
    }
}));

export default useEventStore;
