import { getAllCompanies, getAllDesignations } from "@/api/extras";
import { CompanyType, DesignationType } from "@/types";
import { create } from "zustand";

interface ExtrasStore {
    loading: boolean;
    companies: CompanyType[];
    designations: DesignationType[];
    getCompanies: (search?: string) => Promise<void>;
    getDesignations: (search?: string) => Promise<void>;
}

const useExtrasStore = create<ExtrasStore>((set) => ({
    loading: false,
    companies: [],
    designations: [],
    getCompanies: async (search?: string) => {
        const response = await getAllCompanies(search);
        set({companies: response});
    },
    getDesignations: async (search?: string) => {
        const response = await getAllDesignations(search);
        set({designations: response});
    },
}));

export default useExtrasStore;
