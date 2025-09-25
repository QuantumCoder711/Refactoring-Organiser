import { getAllCompanies, getAllDesignations, getAllIndustries } from "@/api/extras";
import { CompanyType, DesignationType } from "@/types";
import { create } from "zustand";

interface ExtrasStore {
    loading: boolean;
    companies: CompanyType[];
    designations: DesignationType[];
    industries: String[];
    getCompanies: (search?: string, industry?: string, employeeSize?: string, page?: number) => Promise<void>;
    getDesignations: (search?: string) => Promise<void>;
    getIndustries: (search?: string) => Promise<void>;
}

const useExtrasStore = create<ExtrasStore>((set) => ({
    loading: false,
    companies: [],
    designations: [],
    industries: [],
    getCompanies: async (search?: string, industry?: string, employeeSize?: string, page?: number) => {
        const response = await getAllCompanies(search, industry, employeeSize, page);
        set({companies: response});
    },
    getDesignations: async (search?: string) => {
        const response = await getAllDesignations(search);
        set({designations: response});
    },
    getIndustries: async (search?: string) => {
        const response = await getAllIndustries(search);
        set({industries: response});
    }
}));

export default useExtrasStore;
