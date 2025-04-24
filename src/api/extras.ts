import { domain } from "@/constants";
import { CompanyType, IndustryType, JobTitleType } from "@/types";
import axios from "axios";

export const getAllCompanies = async (): Promise<CompanyType[]> => {
    try {
        const response = await axios.get(`${domain}/api/companies`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export const getAllJobTitles = async (): Promise<JobTitleType[]> => {
    try {
        const response = await axios.get(`${domain}/api/job-titles`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}

export const getAllIndustries = async (): Promise<IndustryType[]> => {
    try {
        const response = await axios.get(`${domain}/api/get-industries`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}