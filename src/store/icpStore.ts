import { domain, token } from "@/constants";
import axios from "axios";
import { create } from "zustand";

interface SheetRow {
    companyname: string;
    designation: string[];
    country_name: string;
    state_name: string;
    employee_size: string;
    priority: string;
    uuid: string;
}

interface ICPSheet {
    sheetRows: SheetRow[];
    sheet_name: string;
    uuid: string;
}

interface CreateICPPayload {
    sheet_name: string;
    employee_size: string;
    designation: string[];
    company_name: string[];
    state_name: string;
    country_name: string;
    priority: string[];
}

interface ICPStore {
    loading: boolean;
    icpSheets: ICPSheet[];
    getICPSheets: (userId: number) => Promise<void>;
    deleteICPSheet: (uuid: string) => Promise<{ status: number; message: string } | void>;
    uploadICPSheet: (userId: number, file: File, sheetName: string) => Promise<{ status: number; message?: string } | void>;
    createICP: (payload: CreateICPPayload) => Promise<{ success: boolean; message?: string }>;
    // Entry-level CRUD (console.log only for now)
    addICPEntry: (sheetUuid: string, entry: SheetRow, userId: number) => Promise<{ success: boolean; message: string }>;
    updateICPEntry: (sheetUuid: string, rowUuid: string, rowIndex: number, entry: SheetRow, userId: number) => Promise<{ success: boolean; message: string }>;
    deleteICPEntry: (sheetUuid: string, rowUuid: string) => Promise<{ success: boolean; message: string }>;
}

const useICPStore = create<ICPStore>((set, get) => ({
    loading: false,
    icpSheets: [],
    createICP: async (payload: CreateICPPayload) => {
        try {
            const response = await axios.post(`${domain}/api/store-icp`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.data.success) {
                return {
                    success: response.data.success,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to create ICP',
                };
            }
        } catch (error) {
            console.error('Failed to create ICP:', error);
            throw error;
        }
    },
    getICPSheets: async (userId: number) => {
        set({ loading: true });
        try {
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
        } finally {
            set({ loading: false });
        }
    },
    deleteICPSheet: async (uuid: string) => {
        const { icpSheets } = get();
        set({ icpSheets: icpSheets.filter((s) => s.uuid !== uuid) });
        try {
            const response = await axios.delete(`${domain}/api/delete-icp-data/${uuid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response?.data?.status !== undefined) {
                return { status: response.data.status, message: response.data.message };
            }
        } catch (error) {
            set({ icpSheets });
            throw error;
        }
    },
    uploadICPSheet: async (userId: number, file: File, sheetName: string) => {
        try {
            const formData = new FormData();
            formData.append('user_id', String(userId));
            formData.append('file', file);
            formData.append('sheet_name', sheetName);

            const response = await axios.post(`${domain}/api/store-icp-data`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Refresh list after successful upload
            if (response?.data?.status === 200 || response?.data?.status === 201) {
                await get().getICPSheets(userId);
            }

            if (response?.data?.status !== undefined) {
                return { status: response.data.status, message: response.data.message };
            }
        } catch (error) {
            throw error;
        }
    },
    addICPEntry: async (sheetUuid: string, entry: SheetRow, userId: number) => {
        const data = {
            user_id: userId,
            company_name: entry.companyname,
            designation: entry.designation,
            priority: entry.priority,
            country_name: entry.country_name,
            state_name: entry.state_name,
            employee_size: entry.employee_size
        };

        await axios.post(`${domain}/api/add-icp-data/${sheetUuid}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        set((state) => ({
            icpSheets: state.icpSheets.map((s) =>
                s.uuid === sheetUuid ? { ...s, sheetRows: [entry, ...s.sheetRows] } : s
            ),
        }));
        return Promise.resolve({ success: true, message: 'Entry added' });
    },
    updateICPEntry: async (sheetUuid, rowUuid, rowIndex, entry, userId) => {
        const data = {
            company_name: entry.companyname,
            designation: entry.designation,
            country_name: entry.country_name,
            state_name: entry.state_name,
            employee_size: entry.employee_size,
            priority: entry.priority,
            _method: 'PUT',
            user_id: userId
        }
        await axios.post(`${domain}/api/update-icp-data/${rowUuid}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        set((state) => ({
            icpSheets: state.icpSheets.map((s) =>
                s.uuid === sheetUuid
                    ? {
                        ...s,
                        sheetRows: s.sheetRows.map((r, i) => (i === rowIndex ? entry : r)),
                    }
                    : s
            ),
        }));
        return Promise.resolve({ success: true, message: 'Entry updated' });
    },
    deleteICPEntry: async (sheetUuid, rowUuid) => {
        axios.delete(`${domain}/api/delete-icp/${rowUuid}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        set((state) => ({
            icpSheets: state.icpSheets.map((s) =>
                s.uuid === sheetUuid
                    ? { ...s, sheetRows: s.sheetRows.filter((r) => r.uuid !== rowUuid) }
                    : s
            ),
        }));
        return Promise.resolve({ success: true, message: 'Entry deleted' });
    }
}));

export default useICPStore;














