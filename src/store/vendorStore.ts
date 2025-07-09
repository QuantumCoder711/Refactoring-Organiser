import { create } from "zustand";

import { getAcquisitionVendors, getGiftingVendors, getEventSetupVendors } from "@/api/vendors";
import { VendorCompanyType } from "@/types";

export interface VendorStore {
    acquisitionVendors: VendorCompanyType[];
    giftingVendors: VendorCompanyType[];
    eventSetupVendors: VendorCompanyType[];
    loading: boolean;
    getAcquisitionVendors: () => Promise<void>;
    getGiftingVendors: () => Promise<void>;
    getEventSetupVendors: () => Promise<void>;
}

const useVendorStore = create<VendorStore>((set) => ({
    acquisitionVendors: [],
    giftingVendors: [],
    eventSetupVendors: [],
    loading: false,
    getAcquisitionVendors: async () => {
        try {
            set({ loading: true });
            const response = await getAcquisitionVendors();
            set({ acquisitionVendors: response.data });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    getGiftingVendors: async () => {
        try {
            set({ loading: true });
            const response = await getGiftingVendors();
            set({ giftingVendors: response.data });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    getEventSetupVendors: async () => {
        try {
            set({ loading: true });
            const response = await getEventSetupVendors();
            set({ eventSetupVendors: response.data });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));

export default useVendorStore;