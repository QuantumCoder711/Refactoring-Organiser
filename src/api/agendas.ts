import { domain, token } from "@/constants";
import axios from "axios";
import { GetEventAgendasResponse } from "@/types/api-responses";

export const getEventAgendas = async (id: number): Promise<GetEventAgendasResponse> => {
    try {
        const response = await axios.get(`${domain}/api/all-agendas/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch agendas");
        }
        throw new Error("An unexpected error occurred");
    }
}