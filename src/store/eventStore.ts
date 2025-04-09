import { getAllEvents } from "@/api/events";
import { create } from "zustand";
import { EventType } from "@/types";

interface EventStore {
    events: EventType[];
    setEvents: (events: EventType[]) => void;
    getAllEvents: (token: string) => Promise<void>;
    getEventBySlug: (slug: string | undefined) => EventType | null;
}

const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    setEvents: (events: EventType[]) => set({ events }),
    getAllEvents: async (token: string) => {
        const response = await getAllEvents(token);
        set({ events: response.data });
    },
    getEventBySlug: (slug: string | undefined) => {
        const { events } = get();
        return events.find(event => event.slug === slug) || null;
    }
}));

export default useEventStore;
