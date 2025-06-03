import { create } from "zustand";
import { AgendaType } from "@/types";
import { deleteAgenda, getAgendaById, getEventAgendas, importAgenda, updateAgenda } from "@/api/agendas";
import { BasicResponse, GetEventAgendasResponse } from "@/types/api-responses";

interface EventAgendas {
    event_id: number | null;
    agendas: AgendaType[]
}

interface AgendaStore {
    allEventAgendas: EventAgendas[];
    loading: boolean;
    currentAgenda: AgendaType | null;
    getEventAgendas: (id: number | undefined) => Promise<AgendaType[] | undefined>;
    getAgendaById: (id: string) => Promise<AgendaType | null>;
    updateAgenda: (uuid: string, formData: any) => Promise<BasicResponse>;
    deleteAgenda: (uuid: string) => Promise<BasicResponse>;
    importAgenda: (event_id: number, new_event_id: number, date: string) => Promise<GetEventAgendasResponse>;
}

const useAgendaStore = create<AgendaStore>((set, get) => ({
    allEventAgendas: [],
    loading: false,
    currentAgenda: null,
    getEventAgendas: async (id: number | undefined) => {
        if (!id) return undefined;
        const existingAgendas = get().allEventAgendas.find(ea => ea.event_id === id);
        if (existingAgendas?.event_id) return existingAgendas.agendas;

        try {
            set({ loading: true });
            const response = await getEventAgendas(id);
            set((state) => ({
                allEventAgendas: [...state.allEventAgendas, { event_id: id, agendas: response.data }]
            }));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    getAgendaById: async (id: string) => {
        try {
            set({ loading: true });
            const response = await getAgendaById(id);
            if (response.status === 200) {
                set({ currentAgenda: response.data });
                return response.data;
            }
            return null;
        } catch (error) {
            console.error("Error fetching agenda:", error);
            return null;
        } finally {
            set({ loading: false });
        }
    },
    updateAgenda: async (uuid: string, formData: any) => {
        try {
            set({ loading: true });
            const response = await updateAgenda(uuid, formData);
            if (response.status === 200) {
                // Update the agenda in the store
                set((state) => ({
                    allEventAgendas: state.allEventAgendas.map(ea => ({
                        ...ea,
                        agendas: ea.agendas.map(agenda =>
                            agenda.uuid === uuid ? { ...agenda, ...formData } : agenda
                        )
                    })),
                    currentAgenda: null // Reset current agenda
                }));
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    deleteAgenda: async (uuid: string) => {
        try {
            set({ loading: true });
            const response = await deleteAgenda(uuid);
            if (response.status === 200) {
                set((state) => ({
                    allEventAgendas: state.allEventAgendas.map(ea => ({
                        ...ea,
                        agendas: ea.agendas ? ea.agendas.filter(agenda => agenda.uuid !== uuid) : []
                    }))
                }));
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    importAgenda: async (event_id: number, new_event_id: number, date: string) => {
        try {
            set({ loading: true });
            const response = await importAgenda(event_id, new_event_id, date);
            if (response.status === 200) {
                set(() => ({
                    allEventAgendas: [...response.data]
                }));
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));

export default useAgendaStore;