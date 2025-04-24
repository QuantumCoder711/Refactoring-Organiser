import { getAllCompanies, getAllJobTitles, getAllIndustries } from "@/api/extras";
import { CompanyType, IndustryType, JobTitleType } from "@/types";
import { create } from "zustand";

interface ExtrasStore {
    companies: CompanyType[];
    jobTitles: JobTitleType[];
    industries: IndustryType[];
    loading: boolean;
    getAllCompanies: () => Promise<void>;
    getAllJobTitles: () => Promise<void>;
    getAllIndustries: () => Promise<void>;
    fetchExtras: () => Promise<void>;
}

const useExtrasStore = create<ExtrasStore>((set) => ({
    companies: [],
    jobTitles: [],
    industries: [],
    loading: false,
    
    getAllCompanies: async () => {
        try {
            set({ loading: true });
            const response = await getAllCompanies();
            set({ companies: response });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    getAllJobTitles: async () => {
        try {
            set({ loading: true });
            const response = await getAllJobTitles();
            set({ jobTitles: response });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    getAllIndustries: async () => {
        try {
            set({ loading: true });
            const response = await getAllIndustries();
            set({ industries: response });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    
    fetchExtras: async () => {
        try {
            set({ loading: true });
            const [companiesData, jobTitlesData, industriesData] = await Promise.all([
                getAllCompanies(),
                getAllJobTitles(),
                getAllIndustries()
            ]);
            set({ 
                companies: companiesData,
                jobTitles: jobTitlesData,
                industries: industriesData
            });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));

export default useExtrasStore;
