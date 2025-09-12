import { domain, token } from "@/constants";
import axios from "axios";
import { create } from "zustand";

interface SheetRow {
    companyname: string;
    designation: string[];
    priority: string;
}

interface ICPSheet {
    sheetRows: SheetRow[];
    sheet_name: string;
    uuid: string;
}

interface ICPStore {
    loading: boolean;
    icpSheets: ICPSheet[];
    getICPSheets: (userId: number) => Promise<void>;
}

const useICPStore = create<ICPStore>((set) => ({
    loading: false,
    icpSheets: [],
    getICPSheets: async (userId: number) => {
        set({ loading: true });
        const response = await axios.get(`${domain}/api/get-icp-data/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (response.data.status === 200) {
            set({ icpSheets: response.data.data });
        } else {
            console.error('Failed to fetch ICP sheets:', response.data.message);
            throw new Error(response.data.message);
        }

        set({ loading: false });
    }
}));

export default useICPStore;














