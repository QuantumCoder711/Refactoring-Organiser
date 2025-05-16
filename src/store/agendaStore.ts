import { create } from "zustand";
import { AgendaType } from "@/types";
import { deleteAgenda, getEventAgendas, importAgenda } from "@/api/agendas";
import { BasicResponse, GetEventAgendasResponse } from "@/types/api-responses";

interface EventAgendas {
    event_id: number | null;
    agendas: AgendaType[]
}

interface AgendaStore {
    allEventAgendas: EventAgendas[];
    loading: boolean;
    getEventAgendas: (id: number | undefined) => Promise<AgendaType[] | undefined>;
    deleteAgenda: (uuid: string) => Promise<BasicResponse>;
    importAgenda: (event_id: number, new_event_id: number, date: string) => Promise<GetEventAgendasResponse>;
}

const useAgendaStore = create<AgendaStore>((set, get) => ({
    allEventAgendas: [],
    loading: false,
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