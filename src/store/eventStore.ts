import { addEvent, deleteEvent, getAllEvents, updateEvent } from "@/api/events";
import { create } from "zustand";
import { AddEventType, EventType } from "@/types";
import { AddEventResponse, DeleteEventResponse } from "@/types/api-responses";

interface EventStore {
    events: EventType[];
    addEvent: (event: AddEventType, token?: string) => Promise<AddEventResponse>;
    setEvents: (events: EventType[]) => void;
    getAllEvents: (token: string) => Promise<void>;
    getEventBySlug: (slug: string | undefined) => EventType | null;
    updateEvent: (id: string, event: AddEventType) => Promise<AddEventResponse>;
    deleteEvent: (id: number) => Promise<DeleteEventResponse>;
    checkInCounts: { [eventUuid: string]: number };
    setCheckInCount: (eventUuid: string, count: number) => void;
}

const useEventStore = create<EventStore>((set, get) => ({
    events: [],
    checkInCounts: {},
    setCheckInCount: (eventUuid, count) =>
        set((state) => ({
            checkInCounts: { ...state.checkInCounts, [eventUuid]: count },
        })),
    setEvents: (events: EventType[]) => set({ events }),
    getAllEvents: async (token: string) => {
        const response = await getAllEvents(token);
        set({ events: response.data });
    },
    getEventBySlug: (slug: string | undefined) => {
        const { events } = get();
        return events.find(event => event.slug === slug) || null;
    },
    addEvent: async (event: AddEventType, token?: string) => {
        try {
            // If token is passed then use it, otherwise get it from localStorage
            const tokenToUse = token || (localStorage.getItem("klout-organiser-storage") ? JSON.parse(localStorage?.getItem("klout-organiser-storage") || "").state.token : null);

            const response = await addEvent(event, tokenToUse);
            if (response.status === 200) {
                // Add the new event to the store
                set((state) => ({
                    events: [...state.events, response.data]
                }));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateEvent: async (id: string, event: AddEventType) => {
        try {
            // Get token from localStorage
            const tokenData = localStorage.getItem("klout-organiser-storage");
            const token = tokenData ? JSON.parse(tokenData).state.token : null;

            if (!token) {
                throw new Error("Authentication token not found");
            }

            const response = await updateEvent(id, event, token);
            if (response.status === 200) {
                // Update the event in the store
                set((state) => ({
                    events: state.events.map(e => String(e.id) === id ? response.data : e)
                }));
            }
            return response;
        } catch (error) {
            throw error;
        }
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
