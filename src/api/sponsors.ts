import axios from "axios";
import { domain } from "@/constants";

export const getAllEventsSponsors = async (token: string) => {
    try {
        const response = await axios.post(`${domain}/api/totalsponsors`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch sponsors");
        }
        throw new Error("An unexpected error occurred");
    }
}