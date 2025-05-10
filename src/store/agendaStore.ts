import { create } from "zustand";
import { AgendaType } from "@/types";
import { GetEventAgendasResponse } from "@/types/api-responses";
import { getEventAgendas } from "@/api/agendas";

interface AgendaStore {
    agendas: AgendaType[];
    loading: boolean;
    getEventAgendas: (id: number | undefined) => Promise<GetEventAgendasResponse>;
}

const useAgendaStore = create<AgendaStore>((set) => ({
    agendas: [],
    loading: false,
    getEventAgendas: async (id: number | undefined) => {
        if(!id) return { status: 400, message: "Event Id is required", data: [] };
        try {
            set({ loading: true });
            const response = await getEventAgendas(id);
            set({ agendas: response.data });
            return response;
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));

export default useAgendaStore;
