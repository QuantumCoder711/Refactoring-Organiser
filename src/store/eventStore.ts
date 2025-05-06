import { deleteEvent, getAllEvents } from "@/api/events";
import { create } from "zustand";
import { EventType } from "@/types";
import { DeleteEventResponse } from "@/types/api-responses";

interface EventStore {
    events: EventType[];
    setEvents: (events: EventType[]) => void;
    getAllEvents: (token: string) => Promise<void>;
    getEventBySlug: (slug: string | undefined) => EventType | null;
    deleteEvent: (id: number) => Promise<DeleteEventResponse>;
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
    },
    deleteEvent: async (id: number) => {
        try {
            const response = await deleteEvent(id);
            if (response.status === 200) {
                // Remove the deleted event from the store
                set((state) => ({
                    events: state.events.filter(event => event.id !== id)
                }));
            }
            return response;
        } catch (error) {
            throw error;
        }
    }
}));

export default useEventStore;
