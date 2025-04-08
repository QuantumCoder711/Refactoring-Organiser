import { getAllEventsSponsors } from "@/api/sponsors";
import { SponsorType } from "@/types";
import { create } from "zustand";

interface SponsorStore {
    allEventsSponsors: SponsorType[];
    getAllEventsSponsors: (token: string) => Promise<void>;
}

const useSponsorStore = create<SponsorStore>((set) => ({
    allEventsSponsors: [],
    getAllEventsSponsors: async (token: string) => {
        const response = await getAllEventsSponsors(token);
        set({ allEventsSponsors: response.data });
    }
}));

export default useSponsorStore;