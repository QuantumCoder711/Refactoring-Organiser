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

export const deleteAgenda = async (uuid: string) => {
    try {
        const response = await axios.delete(`${domain}/api/agendas/${uuid}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to delete agenda");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const importAgenda = async (event_id: number, new_event_id: number, date: string) => {
    try {
        const response = await axios.post(`${domain}/api/duplicate-agendas`, {
            event_id,
            new_event_id,
            date
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to import agenda");
        }
        throw new Error("An unexpected error occurred");
    }
}

export const getEventSpeakers = async (event_id: number) => {
    try {
        const response = await axios.get(`${domain}/api/event-speakers/${event_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch speakers");
        }
        throw new Error("An unexpected error occurred");
    }
}