import { domain, token } from "@/constants";
import axios from "axios";

export const getTranscribeSummary = async (formData: any) => {
    try {
        const response = await axios.post(`${domain}/api/transcriber`, formData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch summary");
        }
        throw new Error("An unexpected error occurred");
    }

}